const GENERIC_TOKENS = new Set([
  "beer","strong","premium","lager","witbier","ale","ml","cl","bottle","bottles",
  "can","cans","case","cases","pack","pcs","pc","unit","units","product"
]);

function norm(value){
  return String(value||"")
    .toLowerCase()
    .replace(/&/g," and ")
    .replace(/[^a-z0-9]+/g," ")
    .trim()
    .replace(/\s+/g," ");
}

function num(value){
  const n=Number(value);
  return Number.isFinite(n)?n:0;
}

function moneyKey(value){
  return num(value).toFixed(2);
}

function intKey(value){
  return String(Math.max(0,Math.round(num(value))));
}

function distinctiveTokens(value){
  return norm(value)
    .split(" ")
    .filter(Boolean)
    .filter((token)=>!GENERIC_TOKENS.has(token))
    .filter((token)=>!/^\d{1,3}$/.test(token));
}

function hasProductReference(row){
  return Boolean(row?.productId || row?.pendingProduct);
}

function productIdentityKey(row){
  if(row?.productId)return `id:${row.productId}`;
  const pending=row?.pendingProduct;
  if(!pending)return "";
  return [
    "pending",
    norm(pending.productName||row.productName||row.sourceDescription),
    norm(pending.brand),
    String(Math.round(num(pending.sizeMl||row.sizeMl))),
    norm(pending.barcode||row.scannedBarcode),
  ].join(":");
}

export function explicitPackageType(value){
  const text=norm(value);
  const can=/\bcan\b|\bcans\b/.test(text);
  const bottle=/\bbottle\b|\bbottles\b/.test(text);
  if(can&&!bottle)return "CAN";
  if(bottle&&!can)return "BOTTLE";
  return "";
}

export function purchaseIdentityIssues(row,product){
  const issues=[];

  if(!hasProductReference(row)||!product){
    issues.push("Product Master selection or prepared new product is required.");
    return issues;
  }

  const invoiceSize=num(row.invoiceSizeMl);
  const productSize=num(product.sizeMl);

  if(invoiceSize>0&&productSize>0&&Math.abs(invoiceSize-productSize)>5){
    const targetLabel=product?.pending?"Prepared Product":"Product Master";
    issues.push(
      `Size mismatch: invoice ${Math.round(invoiceSize)} ml ≠ ${targetLabel} ${Math.round(productSize)} ml.`,
    );
  }

  const scanned=String(row.scannedBarcode||"").trim();
  const master=String(product.barcode||"").trim();

  if(scanned&&master&&scanned!==master){
    issues.push(
      `Barcode mismatch: scanned ${scanned} ≠ Product ${master}.`,
    );
  }

  const invoicePackage=explicitPackageType(
    `${row.sourceDescription||""} ${row.sourceItem?.packing||""} ${row.sourceItem?.packageType||""}`,
  );
  const productPackage=explicitPackageType(
    `${product.name||""} ${product.subcategory||""} ${product.packageType||""}`,
  );

  if(invoicePackage&&productPackage&&invoicePackage!==productPackage){
    issues.push(
      `Package mismatch: invoice says ${invoicePackage.toLowerCase()} but Product says ${productPackage.toLowerCase()}.`,
    );
  }

  const invoiceTokens=distinctiveTokens(row.sourceDescription);
  const productTokens=distinctiveTokens(`${product.name||""} ${product.brand||""}`);

  if(invoiceTokens.length&&productTokens.length){
    const productSet=new Set(productTokens);
    const overlap=invoiceTokens.some((token)=>productSet.has(token));
    if(!overlap){
      issues.push(
        `Product identity mismatch: invoice "${String(row.sourceDescription||"").trim()}" does not share a distinctive name/brand token with Product "${String(product.name||"").trim()}".`,
      );
    }
  }

  return issues;
}

export function duplicateLineSignature(row){
  const identity=productIdentityKey(row);
  if(!identity)return "";

  return [
    identity,
    norm(row.sourceDescription),
    String(Math.round(num(row.invoiceSizeMl))),
    intKey(row.caseCount),
    intKey(row.unitsPerCase),
    intKey(row.looseBottles),
    intKey(row.quantity),
    moneyKey(row.ratePerCase),
    num(row.purchasePrice).toFixed(6),
    moneyKey(row.mrp),
    moneyKey(row.lineAmount),
    norm(row.batchNumber),
    String(row.expiryDate||"").trim(),
  ].join("|");
}

export function findSuspiciousDuplicateGroups(items){
  const groups=new Map();

  (items||[]).forEach((row,index)=>{
    const signature=duplicateLineSignature(row);
    if(!signature)return;
    const list=groups.get(signature)||[];
    list.push(index);
    groups.set(signature,list);
  });

  return [...groups.entries()]
    .filter(([,indexes])=>indexes.length>1)
    .map(([signature,indexes])=>({signature,indexes}));
}

function packDone(state){
  return ["VERIFIED_EVIDENCE","CONFIRMED_AS_POSTED","CORRECTED","MANUAL_ENTRY"]
    .includes(String(state||""));
}

export function purchaseLineReviewReasons(
  row,
  product,
  {duplicatePending=false}={},
){
  const reasons=[];

  if(!hasProductReference(row)||!product){
    reasons.push("Select an existing Product Master or prepare a new product.");
  }

  const cases=num(row?.caseCount);
  const units=num(row?.unitsPerCase);
  const loose=num(row?.looseBottles);
  const quantity=num(row?.quantity);

  if(
    !Number.isInteger(cases)||
    !Number.isInteger(units)||
    !Number.isInteger(loose)||
    !Number.isInteger(quantity)||
    cases<0||
    units<=0||
    loose<0||
    quantity<=0
  ){
    reasons.push("Cases, Bottles/Case, Loose and Final Bottles must be valid whole-bottle quantities.");
  }else if(quantity!==cases*units+loose){
    reasons.push("Final Bottles must equal Cases × Bottles/Case + Loose.");
  }

  if(!packDone(row?.packResolution?.state)){
    reasons.push("Pack review is not confirmed.");
  }

  const purchasePrice=num(row?.purchasePrice);
  const mrp=num(row?.mrp||product?.mrp);
  if(mrp>0&&purchasePrice>=mrp){
    reasons.push(
      `Price/Bottle ₹${purchasePrice.toFixed(2)} must be below MRP ₹${mrp.toFixed(2)}.`,
    );
  }

  reasons.push(...purchaseIdentityIssues(row,product));

  if(duplicatePending){
    reasons.push(
      "Possible duplicate invoice row: all commercial fields match another row. Verify the physical invoice and use Keep Separate only when both rows are real.",
    );
  }

  return [...new Set(reasons)];
}

export function purchaseLineStatus(row,product,options={}){
  return purchaseLineReviewReasons(row,product,options).length
    ?"NEEDS_REVIEW"
    :"READY";
}
