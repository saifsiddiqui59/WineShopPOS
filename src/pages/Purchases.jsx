import { useEffect,useMemo,useRef,useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { useScanner } from "../context/ScannerContext";
import MobileBarcodeScanner from "../components/MobileBarcodeScanner";
import { getInvoiceReadUrl } from "../lib/invoiceClient";
import { inferInvoiceSizeMl,resolveInvoiceUnitsPerCase } from "../lib/invoicePack";
import { inferBrandFromProductName,inferCategoryId,normalizeBeerOcrText } from "../lib/productInference";
import { saveOfflinePurchaseDraft,loadOfflinePurchaseDraft,removeOfflinePurchaseDraft,countOfflinePurchaseDrafts,pruneEmptyManualPurchaseDrafts } from "../lib/offlinePurchaseDraft";
import { probeBackendConnectivity } from "../lib/connectivity";
import IndianDateInput from "../components/IndianDateInput";
import { formatIndiaDate } from "../lib/indiaDate";
import {
  duplicateLineSignature,
  findSuspiciousDuplicateGroups,
  purchaseIdentityIssues,
  purchaseLineReviewReasons,
  purchaseLineStatus,
} from "../lib/purchaseIdentity";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const normalize=v=>String(v||"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const id=p=>`${p}-${crypto.randomUUID?.()||Date.now()}`;
const chargesFromInvoice=(invoice={})=>{const f=invoice?.financialAdjustments||{};return{freightAmount:Math.max(0,Number(invoice?.freightAmount||f?.freightCartingAmount||0)),transportAmount:Math.max(0,Number(invoice?.transportAmount||f?.transportAmount||0)),handlingAmount:Math.max(0,Number(invoice?.handlingAmount||f?.handlingAmount||0)),loadingUnloadingAmount:Math.max(0,Number(invoice?.loadingUnloadingAmount||f?.loadingUnloadingAmount||0)),supplierDiscountAmount:Math.max(0,Number(invoice?.supplierDiscountAmount||f?.cashDiscountAmount||0)),invoiceDiscountAmount:Math.max(0,Number(invoice?.invoiceDiscountAmount??f?.otherDeductionAmount??0)),miscellaneousAmount:Math.max(0,Number(invoice?.miscellaneousAmount||f?.miscellaneousAmount||0)),roundingAdjustment:Number(invoice?.roundingAdjustment??f?.roundingAdjustment??0)};};
const bottles=r=>Math.max(0,Math.round(Number(r.caseCount||0)))*Math.max(0,Math.round(Number(r.unitsPerCase||0)))+Math.max(0,Math.round(Number(r.looseBottles||0)));
const packShape=r=>({caseCount:Number(r?.caseCount||0),unitsPerCase:Number(r?.unitsPerCase||0),looseBottles:Number(r?.looseBottles||0),quantity:bottles(r||{})});
const MACHINE_PACK_SOURCES=new Set(["PRODUCT_MASTER","PRODUCT_MASTER_CONFIRMED","PRODUCT_MASTER_VS_PACK_PRIOR","PRICE_MRP_AUTO_SUGGESTED","PRIOR_330ML_BOTTLE_24","PRIOR_500ML_24","PRIOR_650ML_BOTTLE_12","PRIOR_750ML_BOTTLE_12"]);
const machinePackSuggestion=source=>{const s=String(source||"");return MACHINE_PACK_SOURCES.has(s)||s.startsWith("PRIOR_");};
const shopAiReviewSuggestion=(review,fieldId)=>{
  if(review?.status!=="COMPLETED")return null;
  const field=(review?.fields||[]).find(x=>x?.fieldId===fieldId);
  if(!field)return null;
  const verdict=String(field.verdict||"");
  const confidence=String(field.confidence||"LOW");
  if(!["PREFER_DI","PREFER_VISION","INFERRED_VISUAL"].includes(verdict))return null;
  if(!["HIGH","MEDIUM"].includes(confidence))return null;
  const value=String(field.suggestedValue||"").trim();
  return value?{value,reason:String(field.reason||"").trim()}:null;
};

const createPackBaseline=(r,source="PRESENTED_PACK",legacy=false)=>({...packShape(r),source,legacy:Boolean(legacy),capturedAt:new Date().toISOString()});
const packDiffersFromBaseline=(r,baseline)=>{
  if(!baseline)return false;
  const current=packShape(r);
  return ["caseCount","unitsPerCase","looseBottles","quantity"].some(key=>Number(current[key])!==Number(baseline[key]));
};

function rowFromOcr(item,index,product){
  const description=normalizeBeerOcrText(item?.description||`Invoice line ${index+1}`);
  const initialPack=resolveInvoiceUnitsPerCase(item,product);
  let unitsPerCase=Math.max(0,Number(initialPack.value||0));
  const caseCount=Math.max(0,Math.round(Number(item?.caseCount??item?.quantity??0)));
  const looseBottles=Math.max(0,Math.round(Number(item?.looseBottles||0)));
  const amount=Math.max(0,Number(item?.amount||0));
  const ratePerCase=Math.max(0,Number(item?.ratePerCase||item?.unitPrice||0));
  const mrp=Math.max(0,Number(item?.mrp||product?.mrp||0));

  let quantity=unitsPerCase>0?caseCount*unitsPerCase+looseBottles:0;
  let purchasePrice=
    quantity>0&&amount>0
      ?amount/quantity
      :ratePerCase>0&&unitsPerCase>0
        ?ratePerCase/unitsPerCase
        :0;

  let packSource=initialPack.source;
  let packReason=initialPack.strong&&!initialPack.reviewRequired
    ?"Strong invoice/Product Master pack evidence."
    :"";
  let packAutoSuggested=false;

  if(mrp>0&&purchasePrice>=mrp&&caseCount>0){
    const effectiveCaseRate=
      ratePerCase>0
        ?ratePerCase
        :amount>0
          ?amount/caseCount
          :purchasePrice*Math.max(1,unitsPerCase);
    const minimum=Math.max(1,Math.floor(effectiveCaseRate/mrp)+1);
    const common=[6,12,18,24,30,36,48];
    const suggested=common.find((pack)=>pack>=minimum)||minimum;

    if(Number.isInteger(suggested)&&suggested>Math.max(1,unitsPerCase)){
      const previous=Math.max(1,unitsPerCase);
      unitsPerCase=suggested;
      quantity=caseCount*unitsPerCase+looseBottles;
      purchasePrice=
        amount>0&&quantity>0
          ?amount/quantity
          :effectiveCaseRate/unitsPerCase;
      packSource="PRICE_MRP_AUTO_SUGGESTED";
      packAutoSuggested=true;
      packReason=`Auto-suggested ${suggested} bottles/case because ${previous} made Price/Bottle reach/exceed MRP. Verify or change the pack before receiving.`;
    }
  }

  const invoiceSizeMl=Number(
    inferInvoiceSizeMl(item,unitsPerCase)||
    0
  );
  const sizeMl=Number(
    product?.sizeMl||
    invoiceSizeMl||
    0
  );

  const strong=Boolean(
    initialPack.strong &&
    !initialPack.reviewRequired &&
    !packAutoSuggested
  );

  return{
    lineKey:id("ocr"),
    ocrIndex:index,
    sourceDescription:description,
    productId:product?.id||"",
    productName:product?.name||"",
    invoiceSizeMl,
    sizeMl,
    caseCount,
    unitsPerCase,
    looseBottles,
    quantity,
    ratePerCase:Number(ratePerCase.toFixed(6)),
    purchasePrice:Number(Number(purchasePrice||0).toFixed(6)),
    mrp,
    lineAmount:Number(amount.toFixed(2)),
    batchNumber:String(item?.batchNumber||""),
    batchOriginalValue:String(item?.batchOriginalValue||""),
    batchSuggestionSource:String(item?.batchSuggestionSource||""),
    batchSuggestionReason:String(item?.batchSuggestionReason||""),
    batchReviewRequired:Boolean(item?.batchReviewRequired),
    batchResolution:{
      state:item?.batchReviewRequired?"NEEDS_REVIEW":(item?.batchNumber?"OCR_AGREEMENT":"NOT_PRESENT"),
      reason:"",
      updatedAt:null
    },
    expiryDate:String(item?.expiryDate||""),
    barcodeState:product?.barcode?"KNOWN":"ASSIGN_LATER",
    scannedBarcode:product?.barcode||"",
    matchSource:product?"AUTO_MATCH":"UNMATCHED",
    matchScore:product?1:0,
    packResolution:{
      state:strong?"VERIFIED_EVIDENCE":"NEEDS_REVIEW",
      source:packSource,
      suggestedValue:packAutoSuggested
        ?unitsPerCase
        :(initialPack.suggestedValue??initialPack.value??null),
      conflict:Boolean(initialPack.conflict),
      reason:packReason,
      updatedAt:strong?new Date().toISOString():null
    },
    packHistory:[],
    packBaseline:createPackBaseline({caseCount,unitsPerCase,looseBottles,quantity},"OCR_PRESENTED"),
    sourceItem:{
      description:item?.description||"",
      packing:item?.packing||"",
      packageType:item?.packageType||"",
      unitsPerCaseHint:item?.unitsPerCaseHint??null
    }
  };
}

export default function Purchases(){
 const{products,suppliers,categories,purchases,receiveStock,refreshAll}=useShop();const{session}=useAuth();const{lastScan,successBeep}=useScanner();const navigate=useNavigate();const[params]=useSearchParams();const queryIngestion=params.get("ingestion")||"";const[ingestionId,setIngestionId]=useState(queryIngestion),[supplierName,setSupplierName]=useState(""),[supplierId,setSupplierId]=useState(""),[invoiceNumber,setInvoiceNumber]=useState(""),[invoiceDate,setInvoiceDate]=useState(""),[invoiceDateReviewRequired,setInvoiceDateReviewRequired]=useState(false),[notes,setNotes]=useState(""),[items,setItems]=useState([]),[charges,setCharges]=useState(chargesFromInvoice()),[financialSummary,setFinancialSummary]=useState({}),[shopAiReview,setShopAiReview]=useState(null),[shopAiOwnerDecision,setShopAiOwnerDecision]=useState(null),[receiveKey]=useState(()=>id("receive")),[loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[online,setOnline]=useState(true),[sync,setSync]=useState("CHECKING"),[offlineCount,setOfflineCount]=useState(0),[filter,setFilter]=useState("ALL"),[search,setSearch]=useState(""),[selected,setSelected]=useState(0),[scannerIndex,setScannerIndex]=useState(null),[phoneScanIndex,setPhoneScanIndex]=useState(null),[createIndex,setCreateIndex]=useState(null),[createForm,setCreateForm]=useState(null);const timer=useRef(null);
 const byId=useMemo(()=>Object.fromEntries((products||[]).map(p=>[p.id,p])),[products]),active=useMemo(()=>(products||[]).filter(p=>p.active!==false),[products]),activeCategories=useMemo(()=>(categories||[]).filter(c=>c.active!==false),[categories]);
 const productForRow=(row)=>{
   const existing=byId[row?.productId];
   if(existing)return existing;
   const pending=row?.pendingProduct;
   if(!pending)return null;
   return{
     id:`PENDING:${row?.lineKey||"new"}`,
     name:String(pending.productName||row?.productName||row?.sourceDescription||"Pending Product"),
     brand:String(pending.brand||""),
     sizeMl:Number(pending.sizeMl||row?.sizeMl||0),
     barcode:String(pending.barcode||row?.scannedBarcode||""),
     subcategory:String(pending.subcategory||""),
     packageType:String(pending.packageType||""),
     mrp:Number(pending.mrp||row?.mrp||0),
     unitsPerCase:Number(pending.unitsPerCase||row?.unitsPerCase||0),
     pending:true
   };
 };
 const invoiceLineValue=useMemo(()=>items.reduce((s,r)=>s+Math.max(0,Number(r.lineAmount||0)),0),[items]);
 const resolvedProductCost=useMemo(()=>items.reduce((s,r)=>s+Math.max(0,Number(r.quantity||0))*Math.max(0,Number(r.purchasePrice||0)),0),[items]);
 const invoiceProductValue=invoiceLineValue>0?invoiceLineValue:ingestionId?Math.max(0,Number(financialSummary?.lineProductValue||0)):resolvedProductCost;
 const productCostGap=Number((resolvedProductCost-invoiceProductValue).toFixed(2));
 const adjustment=Number(charges.freightAmount||0)+Number(charges.transportAmount||0)+Number(charges.handlingAmount||0)+Number(charges.loadingUnloadingAmount||0)+Number(charges.miscellaneousAmount||0)-Number(charges.supplierDiscountAmount||0)-Number(charges.invoiceDiscountAmount||0)+Number(charges.roundingAdjustment||0);
 const calcTotal=Number((invoiceProductValue+adjustment).toFixed(2));
 const printed=financialSummary?.total==null?null:Number(financialSummary.total);
 const difference=printed==null?null:Number((printed-calcTotal).toFixed(2));
 const financialReady=!ingestionId||(difference!=null&&Math.abs(difference)<=1);
 const shopAiStatus=String(shopAiReview?.status||"");
 const shopAiRecommendation=String(shopAiReview?.recommendation||"REVIEW");
 const shopAiOverrideReason=String(shopAiOwnerDecision?.overrideReason||"").trim();
 const shopAiManualReason=String(shopAiOwnerDecision?.manualReason||"").trim();
 const shopAiSameReview=String(shopAiOwnerDecision?.reviewGeneratedAt||"")===String(shopAiReview?.generatedAt||"");
 const shopAiReady=!ingestionId||!shopAiReview||(
   shopAiSameReview&&(
     shopAiStatus==="UNAVAILABLE"
       ?shopAiOwnerDecision?.decision==="MANUAL_GO"&&shopAiManualReason.length>=4
       :shopAiStatus==="COMPLETED"&&shopAiOwnerDecision?.decision==="GO"&&(shopAiRecommendation==="GO"||shopAiOverrideReason.length>=4)
   )
 );
 function confirmShopAiReviewInReceiving(){
   const review=shopAiReview;
   if(!review)return;
   const reviewGeneratedAt=String(review?.generatedAt||"");
   if(review.status==="UNAVAILABLE"){
     const reason=window.prompt(
       "Automatic verification could not complete. Enter a short note confirming that you checked the original invoice:",
       "Checked against the original invoice."
     );
     if(reason===null||reason.trim().length<4)return;
     setShopAiOwnerDecision({decision:"MANUAL_GO",manualReason:reason.trim(),recommendation:"UNAVAILABLE",reviewGeneratedAt,at:new Date().toISOString()});
     return;
   }
   if(review.status!=="COMPLETED"){
     setMessage("Invoice verification is still processing. Analyze the invoice again before receiving stock.");
     return;
   }
   let overrideReason="";
   if(String(review.recommendation||"REVIEW")!=="GO"){
     const reason=window.prompt(
       "Some invoice details required review. Confirm that you checked/corrected them before receiving stock:",
       "Checked and corrected against the original invoice."
     );
     if(reason===null||reason.trim().length<4)return;
     overrideReason=reason.trim();
   }
   setShopAiOwnerDecision({decision:"GO",recommendation:review.recommendation||"REVIEW",...(overrideReason?{overrideReason}:{}),reviewGeneratedAt,at:new Date().toISOString()});
 }
 const duplicateGroups=useMemo(()=>findSuspiciousDuplicateGroups(items),[items]);
 const duplicateIndexSet=useMemo(()=>new Set(duplicateGroups.flatMap((group)=>group.indexes)),[duplicateGroups]);
 const duplicatePending=(row,index)=>duplicateIndexSet.has(index)&&row?.duplicateResolution!=="KEEP_SEPARATE";
 const lineReasons=(row,index)=>purchaseLineReviewReasons(row,productForRow(row),{duplicatePending:duplicatePending(row,index)});
 const lineStatus=(row,index)=>purchaseLineStatus(row,productForRow(row),{duplicatePending:duplicatePending(row,index)});
 const needsReview=items.filter((row,index)=>lineStatus(row,index)==="NEEDS_REVIEW").length;
 const firstReview=items.map((row,index)=>lineReasons(row,index)[0]).find(Boolean)||"";
 const ready=Boolean(supplierName.trim())&&/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate)&&!invoiceDateReviewRequired&&items.length>0&&!needsReview&&financialReady&&shopAiReady;
 const draftId=ingestionId?`ingestion:${ingestionId}`:`manual:${receiveKey}`;
 const snapshot=()=>({version:2,receiveKey,ingestionId:ingestionId||null,supplierId:supplierId||null,supplierName,invoiceNumber,invoiceDate,invoiceDateReviewRequired,notes,items,charges,financialSummary,shopAiOwnerDecision,updatedAt:new Date().toISOString()});
 async function saveServer(payload,readyFlag=ready){if(!ingestionId)return;const{error}=await supabase.rpc("invoice_save_review_draft",{p_ingestion_id:ingestionId,p_review_draft:{version:2,stage:"RECEIVE_STOCK",purchaseDraft:payload,updatedAt:new Date().toISOString()},p_ready:Boolean(readyFlag)});if(error)throw error;}
 useEffect(()=>{let alive=true;const refresh=async()=>{const probe=await probeBackendConnectivity();if(!alive)return;setOnline(probe.reachable);setSync(current=>probe.reachable?(["SYNCING","SYNCED","SYNC ERROR"].includes(current)?current:"ONLINE"):"OFFLINE");};void refresh();const signal=()=>void refresh();window.addEventListener("online",signal);window.addEventListener("offline",signal);const interval=setInterval(signal,15000);return()=>{alive=false;clearInterval(interval);window.removeEventListener("online",signal);window.removeEventListener("offline",signal);};},[]);
 useEffect(()=>{void pruneEmptyManualPurchaseDrafts().then(()=>countOfflinePurchaseDrafts()).then(setOfflineCount).catch(()=>{});},[]);
 useEffect(()=>{
   if(!loaded)return;
   if(timer.current)clearTimeout(timer.current);
   timer.current=setTimeout(async()=>{
     const p=snapshot();

     // Start the encrypted local recovery write first, but never allow a local
     // IndexedDB failure to prevent an online authoritative server save.
     const localAttempt=saveOfflinePurchaseDraft(draftId,p)
       .then(result=>({ok:true,result}))
       .catch(error=>({ok:false,error}));

     if(online&&ingestionId){
       setSync("SYNCING");
       try{
         await saveServer(p);
         setSync("SYNCED");
       }catch(serverError){
         const local=await localAttempt;
         try{setOfflineCount(await countOfflinePurchaseDrafts());}catch{}
         setSync("SYNC ERROR");
         setMessage(
           local.ok
             ?(serverError?.message||"Server draft sync failed. A local recovery copy was kept.")
             :((serverError?.message||"Server draft sync failed.")+" Local recovery copy also failed"+(local.error?.message?": "+local.error.message:"."))
         );
         return;
       }

       // Server is authoritative and already safe at this point. Local backup
       // maintenance is a separate class and must never downgrade SYNCED.
       const local=await localAttempt;
       try{
         await removeOfflinePurchaseDraft(draftId);
         const currentLocal=await loadOfflinePurchaseDraft(draftId).catch(()=>null);
         if(currentLocal)throw new Error("Current invoice local backup still exists after cleanup.");
         try{setOfflineCount(await countOfflinePurchaseDrafts());}catch{}
         if(!local.ok){
           setMessage("Server draft synced. Local recovery backup was unavailable, but the server copy is safe.");
         }
       }catch(cleanupError){
         try{setOfflineCount(await countOfflinePurchaseDrafts());}catch{}
         setMessage("Server draft synced. Local backup cleanup pending"+(cleanupError?.message?": "+cleanupError.message:"."));
       }
       return;
     }

     const local=await localAttempt;
     try{setOfflineCount(await countOfflinePurchaseDrafts());}catch{}

     if(!online){
       if(local.ok&&local.result?.saved){
         setSync("OFFLINE");
       }else{
         setSync("LOCAL DRAFT ERROR");
         setMessage(local.error?.message||"Local recovery draft could not be saved.");
       }
       return;
     }

     // Manual, non-ingestion purchase: there is no server review-draft RPC.
     if(local.ok){
       setSync(local.result?.saved?"LOCAL SAVED":"ONLINE");
     }else{
       setSync("LOCAL DRAFT ERROR");
       setMessage(local.error?.message||"Local purchase draft could not be saved.");
     }
   },700);
   return()=>clearTimeout(timer.current);
 },[supplierName,supplierId,invoiceNumber,invoiceDate,notes,items,charges,financialSummary,shopAiOwnerDecision,loaded,ingestionId,draftId,online]);
 useEffect(()=>{let alive=true;(async()=>{setLoaded(false);let ingestion=null,serverDraft=null;if(queryIngestion){const{data,error}=await supabase.from("invoice_ingestions").select("id,review_draft,normalized_invoice,shopai_review,extracted_supplier_name,extracted_invoice_number,extracted_invoice_date,extracted_total,purchase_id").eq("id",queryIngestion).maybeSingle();if(!alive)return;if(error)throw error;ingestion=data;setIngestionId(data?.id||queryIngestion);serverDraft=data?.review_draft?.stage==="RECEIVE_STOCK"?data.review_draft.purchaseDraft:null;}let source=serverDraft;if(!source){const local=await loadOfflinePurchaseDraft(queryIngestion?`ingestion:${queryIngestion}`:draftId).catch(()=>null);if(!online&&local?.payload)source=local.payload;}if(!source){try{const d=JSON.parse(sessionStorage.getItem("wineshop_ocr_purchase_draft")||"null");if(d&&(!queryIngestion||String(d.ingestionId||"")===queryIngestion))source=d;}catch{}}
 if(source){setSupplierId(source.supplierId||"");setSupplierName(source.supplierName||"");setInvoiceNumber(source.invoiceNumber||"");setInvoiceDate(source.invoiceDate||"");setInvoiceDateReviewRequired(source.invoiceDateReviewRequired==null?Boolean(ingestion?.normalized_invoice?.invoiceDateReviewRequired):Boolean(source.invoiceDateReviewRequired));setNotes(source.notes||"");setCharges({...chargesFromInvoice(),...(source.charges||{})});setFinancialSummary({...((source.financialSummary)||{}),resolutionAssist:source?.financialSummary?.resolutionAssist||ingestion?.normalized_invoice?.resolutionAssist||null});setShopAiReview(ingestion?.shopai_review||ingestion?.normalized_invoice?.shopAiReview||null);setShopAiOwnerDecision(source.shopAiOwnerDecision||ingestion?.review_draft?.shopAiOwnerDecision||null);setItems((source.items||[]).map((r,i)=>{const p=byId[r.productId];const x={lineKey:r.lineKey||id("draft"),sourceDescription:normalizeBeerOcrText(r.sourceDescription||r.description||p?.name||`Line ${i+1}`),productId:r.productId||"",productName:r.productName||p?.name||r.pendingProduct?.productName||"",reviewedSourceDescription:r.reviewedSourceDescription||"",pendingProduct:r.pendingProduct||null,invoiceSizeMl:Number(r.invoiceSizeMl||inferInvoiceSizeMl({description:r.sourceDescription||r.description||"",packing:r.sourceItem?.packing||"",unitsPerCaseHint:r.sourceItem?.unitsPerCaseHint??null},Number(r.unitsPerCase||0))||0),sizeMl:Number(r.sizeMl||p?.sizeMl||0),caseCount:Number(r.caseCount||0),unitsPerCase:Number(r.unitsPerCase||0),looseBottles:Number(r.looseBottles||0),quantity:Number(r.quantity||0),ratePerCase:Number(r.ratePerCase||0),purchasePrice:Number(r.purchasePrice||0),mrp:Number(r.mrp||p?.mrp||0),lineAmount:Number(r.lineAmount||0),batchNumber:r.batchNumber||"",batchOriginalValue:r.batchOriginalValue||"",batchSuggestionSource:r.batchSuggestionSource||"",batchSuggestionReason:r.batchSuggestionReason||"",batchReviewRequired:r.batchReviewRequired==null?Boolean(ingestion?.normalized_invoice?.items?.[i]?.batchReviewRequired):Boolean(r.batchReviewRequired),batchResolution:r.batchResolution||{state:(r.batchReviewRequired==null?Boolean(ingestion?.normalized_invoice?.items?.[i]?.batchReviewRequired):Boolean(r.batchReviewRequired))?"NEEDS_REVIEW":(r.batchNumber?"OCR_AGREEMENT":"NOT_PRESENT"),reason:"",updatedAt:null},expiryDate:r.expiryDate||"",barcodeState:r.barcodeState||(p?.barcode?"KNOWN":"ASSIGN_LATER"),scannedBarcode:r.scannedBarcode||p?.barcode||"",matchSource:r.matchSource||"DRAFT",matchScore:Number(r.matchScore||0),packResolution:r.packResolution||{state:"NEEDS_REVIEW",source:"RESTORED_DRAFT"},packHistory:r.packHistory||[],packBaseline:r.packBaseline||createPackBaseline(r,"RESTORED_CURRENT",true),sourceItem:r.sourceItem||{}};const q=bottles(x);if(q>0)x.quantity=q;if(x.lineAmount>0&&x.quantity>0)x.purchasePrice=Number((x.lineAmount/x.quantity).toFixed(6));return x;}));setLoaded(true);return;}
 if(ingestion?.normalized_invoice){const reviewed=ingestion?.review_draft?.stage==="OCR_REVIEW"&&ingestion?.review_draft?.result?ingestion.review_draft.result:null;const baseInv=reviewed||ingestion.normalized_invoice,inv={...baseInv,shopAiReview:ingestion?.shopai_review||baseInv?.shopAiReview||null};setShopAiReview(inv.shopAiReview||null);setShopAiOwnerDecision(ingestion?.review_draft?.shopAiOwnerDecision||null);sup=(suppliers||[]).find(s=>normalize(s.supplier_name)===normalize(inv.supplierName)||normalize(s.supplier_name)===normalize(ingestion.extracted_supplier_name)),sid=sup?.id||"",sname=ingestion?.review_draft?.confirmedSupplier?.supplier_name||sup?.supplier_name||inv.supplierName||ingestion.extracted_supplier_name||"";const rows=await Promise.all((inv.items||[]).map(async(item,i)=>{const sz=inferInvoiceSizeMl(item,item?.unitsPerCaseHint)||null,{data:c}=await supabase.rpc("resolve_product_master_text",{p_text:normalizeBeerOcrText(item?.description||""),p_size_ml:sz,p_supplier_id:sid||null,p_limit:5}),top=Array.isArray(c)?c[0]:null,p=top&&Number(top.score||0)>=.9?active.find(x=>x.id===top.product_id)||{id:top.product_id,name:top.product_name,barcode:top.barcode||"",sizeMl:Number(top.size_ml||0),brand:top.brand||"",mrp:Number(item?.mrp||0),unitsPerCase:0}:null,r=rowFromOcr(item,i,p);if(top&&p){r.matchSource=top.match_source||"PRODUCT_MASTER";r.matchScore=Number(top.score||0);}return r;}));setSupplierId(sid);setSupplierName(sname);setInvoiceNumber(inv.invoiceNumber||ingestion.extracted_invoice_number||"");setInvoiceDate(inv.invoiceDate||ingestion.extracted_invoice_date||"");setInvoiceDateReviewRequired(Boolean(inv.invoiceDateReviewRequired));setCharges(chargesFromInvoice(inv));setFinancialSummary({subtotal:inv.subtotal??null,lineProductValue:inv?.financialAdjustments?.lineProductValue??null,total:inv.total??ingestion.extracted_total??null,amountDue:inv.amountDue??null,totalSource:inv?.resolutionAssist?.mappings?.some(m=>m?.targetId==="finance:invoice_total"&&m?.applied)?"AI_DIRECT_EVIDENCE":"OCR",resolutionAssist:inv?.resolutionAssist||null,crossOcr:inv?.crossOcr||null});setItems(rows);}setLoaded(true);})().catch(e=>{if(alive){setMessage(e?.message||"Unable to load Purchase Receiving Workspace.");setLoaded(true);}});return()=>{alive=false};},[queryIngestion]);
 function updateLine(i,k,v){setItems(cur=>cur.map((r,n)=>{if(n!==i)return r;const x={...r,[k]:v,duplicateResolution:"",duplicateReason:""};if(["caseCount","unitsPerCase","looseBottles"].includes(k)){x.quantity=bottles(x);if(x.lineAmount>0&&x.quantity>0)x.purchasePrice=Number((x.lineAmount/x.quantity).toFixed(6));x.packResolution={...x.packResolution,state:"NEEDS_REVIEW",reason:"",updatedAt:new Date().toISOString()};}if(k==="ratePerCase"){x.purchasePrice=Number(x.unitsPerCase)>0?Number((Number(v||0)/Number(x.unitsPerCase)).toFixed(6)):0;if(Number(x.caseCount)>0)x.lineAmount=Number((Number(x.caseCount)*Number(v||0)).toFixed(2));}if(k==="lineAmount"&&Number(x.quantity)>0)x.purchasePrice=Number((Number(v||0)/Number(x.quantity)).toFixed(6));if(x.pendingProduct&&k==="unitsPerCase")x.pendingProduct={...x.pendingProduct,unitsPerCase:Number(v||0)};if(x.pendingProduct&&k==="mrp"){const m=Number(v||0);x.pendingProduct={...x.pendingProduct,mrp:m,sellingPrice:m>0?Number((m+15).toFixed(2)):0};}if(k==="batchNumber"){x.batchReviewRequired=true;x.batchSuggestionSource="HUMAN_EDIT";x.batchResolution={state:"NEEDS_REVIEW",reason:"Batch value edited; confirm against physical invoice.",updatedAt:new Date().toISOString()};}return x;}));}
 function chooseProduct(i,pid){const p=byId[pid];setItems(cur=>cur.map((r,n)=>{if(n!==i)return r;if(!p)return{...r,productId:"",productName:"",pendingProduct:null,matchSource:"UNMATCHED",duplicateResolution:"",duplicateReason:""};const pack=resolveInvoiceUnitsPerCase({description:r.sourceDescription,packing:r.sourceItem?.packing||`${r.sizeMl||p.sizeMl||""} ml`},p),x={...r,productId:p.id,productName:p.name,pendingProduct:null,sizeMl:Number(p.sizeMl||r.sizeMl||0),unitsPerCase:Number(pack.value||r.unitsPerCase||0),barcodeState:p.barcode?"KNOWN":"ASSIGN_LATER",scannedBarcode:p.barcode||r.scannedBarcode||"",matchSource:"USER_SELECTED",matchScore:1,duplicateResolution:"",duplicateReason:"",packResolution:{state:pack.strong&&!pack.reviewRequired?"VERIFIED_EVIDENCE":"NEEDS_REVIEW",source:pack.source,suggestedValue:pack.suggestedValue??pack.value??null,conflict:Boolean(pack.conflict),reason:"",updatedAt:new Date().toISOString()}};x.quantity=bottles(x);if(x.lineAmount>0&&x.quantity>0)x.purchasePrice=Number((x.lineAmount/x.quantity).toFixed(6));return x;}));}

 function stagePendingProduct(i,barcodeOverride="",announce=false){
   const row=items[i];
   if(!row)return false;
   if(row.productId||row.pendingProduct)return true;

   const productName=normalizeBeerOcrText(row.sourceDescription||row.productName||"").trim();
   const size=Math.round(Number(row.invoiceSizeMl||row.sizeMl||0));
   const upc=Math.round(Number(row.unitsPerCase||0));
   const barcodeValue=String(barcodeOverride||row.scannedBarcode||"").trim();

   if(!productName||!Number.isInteger(size)||size<=0||!Number.isInteger(upc)||upc<=0){
     setMessage("This new product still needs a verified Product Name, Size and Bottles/Case. Use Edit New Product Details only for the missing information.");
     return false;
   }

   if(barcodeValue){
     const owner=active.find((p)=>String(p.barcode||"").trim()===barcodeValue);
     if(owner){
       if(Number(owner.sizeMl||0)>0&&Math.abs(Number(owner.sizeMl)-size)>5){
         setMessage(`Barcode ${barcodeValue} belongs to ${owner.name} (${owner.sizeMl} ml), but this invoice row is ${size} ml. Select the correct Product Master or verify the physical barcode.`);
         return false;
       }
       chooseProduct(i,owner.id);
       setMessage(`Barcode ${barcodeValue} already exists as ${owner.name}. Existing Product Master was linked automatically; no duplicate product was staged.`);
       return true;
     }
   }

   const mrp=Number(row.mrp||0);
   const pending={
     productName,
     brand:inferBrandFromProductName(productName),
     categoryId:inferCategoryId(productName,activeCategories),
     subcategory:"",
     sizeMl:size,
     barcode:barcodeValue,
     mrp,
     sellingPrice:mrp>0?Number((mrp+15).toFixed(2)):0,
     minimumStock:5,
     unitsPerCase:upc
   };

   setItems(cur=>cur.map((x,n)=>n===i?{
     ...x,
     productId:"",
     productName,
     pendingProduct:pending,
     sizeMl:size,
     unitsPerCase:upc,
     scannedBarcode:barcodeValue||x.scannedBarcode||"",
     barcodeState:barcodeValue?"PENDING_CREATE":"ASSIGN_LATER",
     matchSource:"PENDING_PRODUCT",
     matchScore:1,
     duplicateResolution:"",
     duplicateReason:""
   }:x));

   if(announce){
     setMessage(barcodeValue
       ?`New product staged from this reviewed invoice row with barcode ${barcodeValue}. Product Master is unchanged until Approve & Receive Stock succeeds.`
       :"New product staged from this reviewed invoice row with barcode Assign Later. Product Master is unchanged until Approve & Receive Stock succeeds.");
   }
   return true;
 }
 function confirmBatch(i){
   const row=items[i];
   if(!row)return;
   const reason=window.prompt(
     `Confirm Batch / Lot for line ${i+1}: ${row.batchNumber||"(blank)"}`,
     "Verified against physical invoice."
   );
   if(reason===null||reason.trim().length<4)return;
   setItems(cur=>cur.map((r,n)=>n===i?{
     ...r,
     batchReviewRequired:false,
     batchSuggestionSource:"HUMAN_CONFIRMED",
     batchResolution:{state:"HUMAN_CONFIRMED",reason:reason.trim(),updatedAt:new Date().toISOString()}
   }:r));
 }

 function confirmPack(i){
   const row=items[i];
   if(!row||Number(row.unitsPerCase)<=0||Number(row.quantity)<=0){setMessage("Enter a valid pack first.");return;}
   if(!row.productId&&!row.pendingProduct&&!stagePendingProduct(i,String(row.scannedBarcode||""),false))return;

   const baseline=row.packBaseline||createPackBaseline(row,"FIRST_CONFIRM_CURRENT",true);
   const changed=Boolean(row.packBaseline)&&packDiffersFromBaseline(row,row.packBaseline);
   const state=changed?"CORRECTED":"CONFIRMED_AS_POSTED";
   const reason=window.prompt(
     changed?"Confirm Pack: what did you correct?":"Confirm Pack: what did you verify?",
     changed?"Corrected after checking invoice/product.":"Verified against invoice/product."
   );
   if(reason===null||reason.trim().length<4)return;

   const at=new Date().toISOString();
   setItems(cur=>cur.map((r,n)=>n===i?{
     ...r,
     packBaseline:r.packBaseline||baseline,
     packResolution:{...r.packResolution,state,reason:reason.trim(),updatedAt:at},
     packHistory:[...(r.packHistory||[]),{
       state,
       reason:reason.trim(),
       caseCount:Number(r.caseCount),
       unitsPerCase:Number(r.unitsPerCase),
       looseBottles:Number(r.looseBottles),
       quantity:Number(r.quantity),
       baseline:r.packBaseline||baseline,
       at
     }]
   }:r));
 }
 function confirmSeparateDuplicate(i){const row=items[i];const signature=duplicateLineSignature(row);if(!signature)return;const indexes=items.map((candidate,index)=>duplicateLineSignature(candidate)===signature?index:-1).filter((index)=>index>=0);if(indexes.length<2)return;const reason=window.prompt(`These ${indexes.length} rows have the same Product Master and the same commercial values. Confirm they are separate physical invoice rows. Why keep them separate?`,"Both rows are present separately on the physical invoice.");if(reason===null||reason.trim().length<4)return;const at=new Date().toISOString();setItems(cur=>cur.map((candidate,index)=>indexes.includes(index)?{...candidate,duplicateResolution:"KEEP_SEPARATE",duplicateReason:reason.trim(),duplicateResolvedAt:at}:candidate));setMessage(`Confirmed ${indexes.length} identical-looking invoice rows as intentional separate lines.`);}
 function applyBarcode(i,code,source="SCANNER"){
   if(i==null)return;
   const r=items[i],p=byId[r?.productId],masterBarcode=String(p?.barcode||"").trim(),scan=String(code||"").trim();
   if(!r||!scan)return;

   if(r.pendingProduct){
     setItems(cur=>cur.map((x,n)=>n===i?{...x,scannedBarcode:scan,barcodeState:"PENDING_CREATE",pendingProduct:{...x.pendingProduct,barcode:scan}}:x));
     setMessage(`Barcode ${scan} received from ${source==="PAIRED_PHONE"?"paired phone":"scanner"} and kept only in this purchase draft. Product Master is unchanged until Receive Stock succeeds.`);
     return;
   }

   if(masterBarcode&&masterBarcode!==scan){
     setItems(cur=>cur.map((x,n)=>n===i?{...x,scannedBarcode:scan,barcodeState:"MISMATCH"}:x));
     setMessage(`Barcode mismatch: scanned ${scan}, but Product Master has ${masterBarcode}. Product Master was NOT changed.`);
     return;
   }

   if(masterBarcode===scan&&masterBarcode){
     setItems(cur=>cur.map((x,n)=>n===i?{...x,scannedBarcode:scan,barcodeState:"KNOWN"}:x));
     setMessage(`Barcode ${scan} verified against Product Master.`);
     return;
   }

   if(!r.productId){
     if(stagePendingProduct(i,scan,true))return;
     setItems(cur=>cur.map((x,n)=>n===i?{...x,scannedBarcode:scan,barcodeState:"SCANNED_PENDING"}:x));
     setMessage(`Barcode ${scan} was saved in this purchase draft. Verify the missing Product Name / Size / Bottles per Case; Product Master is still unchanged.`);
     return;
   }

   setItems(cur=>cur.map((x,n)=>n===i?{...x,scannedBarcode:scan,barcodeState:"PENDING_ASSIGN_ON_RECEIVE"}:x));
   setMessage(`Barcode ${scan} will be assigned to this Product Master only if Approve & Receive Stock succeeds.`);
 }

 function barcode(code){
   const i=scannerIndex;
   setScannerIndex(null);
   applyBarcode(i,code,"THIS_DEVICE_CAMERA");
 }
 useEffect(()=>{
   if(!lastScan?.id||lastScan.source!=="PHONE_REMOTE")return;
   const scan=String(lastScan.barcode||"").trim();
   if(!scan)return;

   if(createIndex!=null&&createForm){
     setCreateForm(current=>current?{...current,barcode:scan}:current);
     setMessage(`Barcode ${scan} received from paired phone and filled into Prepare New Product. Nothing is committed yet.`);
     successBeep();
     return;
   }

   if(phoneScanIndex!=null){
     const target=phoneScanIndex;
     setPhoneScanIndex(null);
     applyBarcode(target,scan,"PAIRED_PHONE");
     successBeep();
   }
 },[lastScan?.id]);

 function armPhoneScan(i){
   setScannerIndex(null);
   setPhoneScanIndex(i);
   setMessage(`Waiting for paired phone barcode for line ${i+1}. Scan on the connected phone now. If needed, pair it under Operations → Phone Scanner.`);
 }

 function openCreate(i){
   const r=items[i],pending=r.pendingProduct||{};
   setPhoneScanIndex(null);
   setCreateIndex(i);
   setCreateForm({
     productName:pending.productName||normalizeBeerOcrText(r.sourceDescription),
     brand:pending.brand||inferBrandFromProductName(r.sourceDescription),
     categoryId:pending.categoryId||inferCategoryId(r.sourceDescription,activeCategories),
     subcategory:pending.subcategory||"",
     sizeMl:Number(pending.sizeMl||r.invoiceSizeMl||r.sizeMl||0)||"",
     barcode:pending.barcode||r.scannedBarcode||"",
     mrp:Number(pending.mrp??r.mrp??0),
     unitsPerCase:Number(pending.unitsPerCase||r.unitsPerCase||0)||""
   });
 }
 function prepareProduct(){
   if(createIndex==null||!createForm)return;
   const size=Number(createForm.sizeMl||0),upc=Number(createForm.unitsPerCase||0);
   const productName=normalizeBeerOcrText(createForm.productName).trim();
   if(!productName||!Number.isInteger(size)||size<=0){setMessage("Verified Product Name and Size (ml) are required. WineShopPOS will not invent a size.");return;}
   if(!Number.isInteger(upc)||upc<=0){setMessage("Verify Bottles/Case first.");return;}
   const barcodeValue=String(createForm.barcode||"").trim();
   const existing=barcodeValue?active.find((p)=>String(p.barcode||"").trim()===barcodeValue):null;
   if(existing){
     if(Number(existing.sizeMl||0)>0&&Math.abs(Number(existing.sizeMl)-size)>5){
       setMessage(`Barcode ${barcodeValue} already belongs to ${existing.name} (${existing.sizeMl} ml). The prepared ${size} ml product was not linked.`);
       return;
     }
     setItems(cur=>cur.map((x,n)=>n===createIndex?{...x,productId:existing.id,productName:existing.name,pendingProduct:null,reviewedSourceDescription:productName,invoiceSizeMl:size,sizeMl:Number(existing.sizeMl||size),unitsPerCase:upc,mrp:Number(createForm.mrp||x.mrp||existing.mrp||0),scannedBarcode:barcodeValue,barcodeState:"KNOWN",matchSource:"BARCODE_EXISTING",packResolution:{...x.packResolution,state:"NEEDS_REVIEW",source:"EXISTING_PRODUCT_BY_BARCODE"}}:x));
     setCreateIndex(null);setCreateForm(null);
     setMessage(`Barcode ${barcodeValue} already exists as ${existing.name}. Existing Product Master was linked; no duplicate product was created.`);
     return;
   }
   const pending={
     productName,
     brand:String(createForm.brand||"").trim(),
     categoryId:createForm.categoryId||null,
     subcategory:String(createForm.subcategory||"").trim(),
     sizeMl:size,
     barcode:barcodeValue||null,
     mrp:Number(createForm.mrp||0),
     sellingPrice:Number(createForm.mrp||0)>0?Number((Number(createForm.mrp)+15).toFixed(2)):0,
     minimumStock:5,
     unitsPerCase:upc
   };
   setItems(cur=>cur.map((x,n)=>{if(n!==createIndex)return x;const y={...x,productId:"",productName,reviewedSourceDescription:productName,pendingProduct:pending,invoiceSizeMl:size,sizeMl:size,unitsPerCase:upc,mrp:pending.mrp,scannedBarcode:barcodeValue||x.scannedBarcode||"",barcodeState:barcodeValue?"PENDING_CREATE":"ASSIGN_LATER",matchSource:"PENDING_PRODUCT",matchScore:1,duplicateResolution:"",duplicateReason:"",packResolution:{...x.packResolution,state:"NEEDS_REVIEW",source:"PENDING_PRODUCT"}};y.quantity=bottles(y);if(y.lineAmount>0&&y.quantity>0)y.purchasePrice=Number((y.lineAmount/y.quantity).toFixed(6));return y;}));
   setCreateIndex(null);setCreateForm(null);
   setMessage("New product prepared in this purchase draft. Product Master is unchanged and the product will be created only if Approve & Receive Stock succeeds.");
 }
 async function viewOriginal(){if(!ingestionId)return setMessage("No original invoice is linked to this manual draft.");try{const r=await getInvoiceReadUrl({token:session?.access_token,ingestionId});window.open(r.url,"_blank","noopener,noreferrer");}catch(e){setMessage(e?.message||"Unable to open original invoice.");}}
 async function existing(ref){if(!ref)return null;const{data}=await supabase.from("purchases").select("id,purchase_number,invoice_number,status").ilike("invoice_number",ref).order("created_at",{ascending:false}).limit(1);return data?.[0]||null;}
 async function link(purchaseId){if(!ingestionId)return;const{error}=await supabase.rpc("invoice_link_purchase",{p_ingestion_id:ingestionId,p_purchase_id:purchaseId});if(error&&!/already|received|linked/i.test(error.message||""))throw error;}
 function reviewedMappingOutcome(mapping){
   const field=String(mapping?.canonicalField||"");
   const target=String(mapping?.targetId||"");
   const expected=mapping?.value;
   const hasNumber=v=>v!==null&&v!==undefined&&v!==""&&Number.isFinite(Number(v));
   const close=(a,b)=>hasNumber(a)&&hasNumber(b)&&Math.abs(Number(a)-Number(b))<=0.01;
   if(target==="header:supplier_name")return normalize(supplierName)===normalize(expected)?"CONFIRMED":"OVERRIDDEN";
   if(target==="header:invoice_number")return normalize(invoiceNumber)===normalize(expected)?"CONFIRMED":"OVERRIDDEN";
   if(target==="header:invoice_date")return String(invoiceDate||"")===String(expected||"")?"CONFIRMED":"OVERRIDDEN";
   if(target==="finance:cash_discount")return close(charges.supplierDiscountAmount,expected)?"CONFIRMED":"OVERRIDDEN";
   if(target==="finance:invoice_discount")return close(charges.invoiceDiscountAmount,expected)?"CONFIRMED":"OVERRIDDEN";
   if(target==="finance:freight")return close(charges.freightAmount,expected)?"CONFIRMED":"OVERRIDDEN";
   if(target==="finance:transport")return close(charges.transportAmount,expected)?"CONFIRMED":"OVERRIDDEN";
   if(target==="finance:handling")return close(charges.handlingAmount,expected)?"CONFIRMED":"OVERRIDDEN";
   if(target==="finance:loading_unloading")return close(charges.loadingUnloadingAmount,expected)?"CONFIRMED":"OVERRIDDEN";
   if(target==="finance:rounding")return close(charges.roundingAdjustment,expected)?"CONFIRMED":"OVERRIDDEN";
   if(target==="finance:invoice_total")return close(financialSummary?.total,expected)?"CONFIRMED":"OVERRIDDEN";
   if(["fees","tcs","other_addition"].includes(field)){
     const group=(financialSummary?.resolutionAssist?.mappings||[]).filter(m=>["fees","tcs","other_addition"].includes(String(m?.canonicalField||""))&&m?.applied);
     const expectedMisc=group.reduce((sum,m)=>sum+Math.abs(Number(m?.value||0)),0);
     return close(charges.miscellaneousAmount,expectedMisc)?"CONFIRMED":"OVERRIDDEN";
   }
   if(target.startsWith("item:")){
     const parts=target.split(":"),index=Number(parts[1]),itemField=parts[2],row=items[index];
     if(!row)return"OVERRIDDEN";
     if(itemField==="description")return normalize(row.sourceDescription)===normalize(expected)?"CONFIRMED":"OVERRIDDEN";
     if(itemField==="case_count")return close(row.caseCount,expected)?"CONFIRMED":"OVERRIDDEN";
     if(itemField==="size_ml")return close(row.invoiceSizeMl,expected)?"CONFIRMED":"OVERRIDDEN";
     if(itemField==="rate_per_case")return close(row.ratePerCase,expected)?"CONFIRMED":"OVERRIDDEN";
     if(itemField==="amount")return close(row.lineAmount,expected)?"CONFIRMED":"OVERRIDDEN";
   }
   return"UNCONFIRMED";
 }
 async function recordOcrLearning(){
   const assist=financialSummary?.resolutionAssist;
   const mappings=(assist?.mappings||[]).filter(m=>m?.source==="AI"||m?.source==="MEMORY");
   if(!ingestionId||!mappings.length)return;
   const reviewed=mappings.map(m=>({...m,outcome:reviewedMappingOutcome(m)}));
   const{error}=await supabase.rpc("invoice_ocr_record_review",{p_ingestion_id:ingestionId,p_supplier_name:supplierName,p_mappings:reviewed});
   if(error)console.warn("OCR mapping learning skipped:",error.message||error);
 }
 async function finishKnown(p,ref){await link(p.id);await recordOcrLearning().catch(()=>{});await removeOfflinePurchaseDraft(draftId).catch(()=>{});await refreshAll();setMessage(`Receive ${ref} was already committed as ${p.purchase_number}. No duplicate inventory was posted.`);navigate(`/purchasing/receipts/${p.id}`);}
 async function receive(){
   if(!ready){
     setMessage(`Receive Stock blocked: ${firstReview||(!shopAiReady?"ShopAI owner GO / override review":!financialReady?"financial reconciliation":!supplierName.trim()?"supplier required":!/^\\d{4}-\\d{2}-\\d{2}$/.test(invoiceDate)?"invoice date required":"review remaining checks")}.`);
     return;
   }

   const ref=invoiceNumber.trim()||`AUTO-${invoiceDate.replaceAll("-","")}-${receiveKey.replace(/[^a-z0-9]/gi,"").slice(-8).toUpperCase()}`;
   const payload={...snapshot(),invoiceNumber:ref,notes:`${notes||""}${notes?"\\n":""}[V5-IDEMPOTENCY:${receiveKey}]`};
   setInvoiceNumber(ref);
   setBusy(true);

   try{
     // Preserve meaningful work first. Blank workspaces are ignored by the
     // V5_24 draft guard.
     await saveOfflinePurchaseDraft(draftId,payload);
     setOfflineCount(await countOfflinePurchaseDrafts());

     // Actual Supabase reachability is authoritative; the browser network hint is not.
     setSync("CHECKING");
     const before=await probeBackendConnectivity({timeoutMs:5000});
     setOnline(before.reachable);

     if(!before.reachable){
       setSync("OFFLINE");
       setMessage("WineShopPOS server is currently unreachable. Draft changes remain encrypted on this device; no inventory was posted.");
       return;
     }

     setSync("SYNCING");
     await saveServer(payload,true);

     const old=await existing(ref);
     if(old)return await finishKnown(old,ref);

     const res=await receiveStock({
       ingestionId:ingestionId||null,
       supplierName:payload.supplierName,
       invoiceNumber:ref,
       invoiceDate:payload.invoiceDate,
       notes:payload.notes,
       items:payload.items.map(r=>({
         productId:r.productId||null,
         pendingProduct:r.pendingProduct||null,
         sourceDescription:r.sourceDescription||"",
         reviewedSourceDescription:r.reviewedSourceDescription||"",
         invoiceSizeMl:Number(r.invoiceSizeMl||0),
         scannedBarcode:String(r.scannedBarcode||""),
         caseCount:Number(r.caseCount),
         unitsPerCase:Number(r.unitsPerCase),
         looseBottles:Number(r.looseBottles),
         quantity:Number(r.quantity),
         ratePerCase:Number(r.ratePerCase||0),
         purchasePrice:Number(Number(r.purchasePrice||0).toFixed(6)),
         mrp:Number(r.mrp||0),
         lineAmount:Number(r.lineAmount||0),
         batchNumber:r.batchNumber||"",
         expiryDate:r.expiryDate||""
       })),
       charges:payload.charges
     });

     if(!res?.ok){
       let committed=null;
       try{committed=await existing(ref);}catch{}
       if(committed)return await finishKnown(committed,ref);

       const after=await probeBackendConnectivity({timeoutMs:4000});
       setOnline(after.reachable);

       if(!after.reachable){
         setSync("OFFLINE");
         setMessage("Connection dropped during Receive. Status UNKNOWN/CHECKING. Do not click Receive again; reconnect first.");
         return;
       }

       throw new Error(res?.message||"Receive failed.");
     }

     if(!res.ingestionLinked)await link(res.purchaseId);
     await removeOfflinePurchaseDraft(draftId);
     setOfflineCount(await countOfflinePurchaseDrafts());
     await refreshAll();
     setSync("SYNCED");
     await recordOcrLearning().catch(()=>{});
     navigate(`/purchasing/receipts/${res.purchaseId}`);
   }catch(e){
     let committed=null;
     try{committed=await existing(ref);}catch{}
     if(committed)return await finishKnown(committed,ref);

     const after=await probeBackendConnectivity({timeoutMs:4000});
     setOnline(after.reachable);
     setSync(after.reachable?"SYNC ERROR":"OFFLINE");
     setMessage(e?.message||"Receive failed.");
   }finally{
     setBusy(false);
   }
 }
 if(!loaded)return <div className="panel">Loading authoritative Purchase Draft...</div>;const q=normalize(search),visible=items.map((row,index)=>({row,index})).filter(({row,index})=>(filter==="ALL"||lineStatus(row,index)===filter)&&(!q||normalize(`${row.sourceDescription} ${byId[row.productId]?.name||row.productName} ${byId[row.productId]?.barcode||row.scannedBarcode}`).includes(q)));
 return <div><div className="page-heading"><div><h2>Purchase Receiving Workspace</h2><p>One review workspace for OCR evidence, Product Master, pack, barcode now/later and final stock receipt.</p></div><div className="button-row">{ingestionId?<button type="button" className="secondary-button" onClick={viewOriginal}>View Original Invoice</button>:null}<button type="button" className="secondary-button" onClick={()=>setItems(x=>[...x,{lineKey:id("manual"),sourceDescription:"Manual purchase line",productId:"",productName:"",sizeMl:0,caseCount:0,unitsPerCase:0,looseBottles:0,quantity:0,ratePerCase:0,purchasePrice:0,mrp:0,lineAmount:0,batchNumber:"",expiryDate:"",barcodeState:"ASSIGN_LATER",scannedBarcode:"",matchSource:"MANUAL",packResolution:{state:"MANUAL_ENTRY",source:"MANUAL_ENTRY"},packHistory:[],packBaseline:null,sourceItem:{}}])}>+ Manual Line</button></div></div><div className={`purchase-sync-strip ${!online?"offline":""}`}>
   <strong>{online?sync:"OFFLINE"}</strong>
   <span>{
     !online
       ?`Review changes are encrypted on this device; inventory posting is blocked.${offlineCount?` ${offlineCount} local draft(s).`:""}`
       :sync==="SYNCED"
         ?"Server Purchase Draft synced."
         :sync==="SYNC ERROR"
           ?"Server Purchase Draft sync failed. Local recovery is retained when available."
           :sync==="LOCAL DRAFT ERROR"
             ?"Local recovery storage failed; server sync state is separate."
             :"Server Purchase Draft is authoritative while online."
   }</span>
 </div>{message?<div className="purchase-message">{message}</div>:null}
 <section className="panel"><div className="form-grid"><label>Supplier<input list="supplier-list-v5" value={supplierName} onChange={e=>{setSupplierName(e.target.value);const s=suppliers.find(x=>normalize(x.supplier_name)===normalize(e.target.value));setSupplierId(s?.id||"");}}/><datalist id="supplier-list-v5">{suppliers.filter(s=>s.active!==false).map(s=><option key={s.id} value={s.supplier_name}/>)}</datalist></label><label>Invoice Number<input value={invoiceNumber} onChange={e=>setInvoiceNumber(e.target.value)}/></label><label>Invoice Date (DD/MM/YYYY)<IndianDateInput value={invoiceDate} onChange={iso=>{setInvoiceDate(iso);setInvoiceDateReviewRequired(!iso)}} aria-label="Invoice Date DD/MM/YYYY"/></label><label>Notes<input value={notes} onChange={e=>setNotes(e.target.value)}/></label></div></section>
 <section className="panel purchase-workspace-toolbar"><div className="button-row"><button type="button" className={filter==="ALL"?"primary-button":"secondary-button"} onClick={()=>setFilter("ALL")}>All</button><button type="button" className={filter==="NEEDS_REVIEW"?"primary-button":"secondary-button"} onClick={()=>setFilter("NEEDS_REVIEW")}>Needs Review ({needsReview})</button><button type="button" className={filter==="READY"?"primary-button":"secondary-button"} onClick={()=>setFilter("READY")}>Ready ({items.length-needsReview})</button><button type="button" className="secondary-button" onClick={()=>{const i=items.findIndex((r,i)=>lineStatus(r,i)==="NEEDS_REVIEW");if(i>=0){setSelected(i);document.getElementById(`purchase-line-${i}`)?.scrollIntoView({behavior:"smooth",block:"center"});}}}>Next Issue</button></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search invoice product, match or barcode..."/></section>
 <div className="purchase-workspace-layout"><section className="panel"><div className="purchase-receiving-scroll"><table className="data-table purchase-receiving-table"><thead><tr><th>#</th><th>Invoice Product</th><th>Product Match</th><th>Barcode</th><th>Size</th><th>Batch / Lot</th><th>Cases</th><th>Bottles/Case</th><th>Loose</th><th>Final Bottles</th><th>Rate/Case</th><th>Price/Bottle</th><th>MRP</th><th>Line Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{visible.map(({row:r,index:i})=><tr id={`purchase-line-${i}`} key={r.lineKey} className={selected===i?"is-selected":""} onClick={()=>setSelected(i)}><td>{i+1}</td><td><strong>{r.sourceDescription}</strong><small>{r.matchSource}</small></td><td><select value={r.productId} onChange={e=>chooseProduct(i,e.target.value)}><option value="">{r.pendingProduct?"Pending new product":"Select existing..."}</option>{active.map(p=><option key={p.id} value={p.id}>{p.name} · {p.sizeMl} ml</option>)}</select>{r.pendingProduct?<><small>Pending: {r.pendingProduct.productName} · created only on successful receive</small><button type="button" className="table-action" onClick={()=>openCreate(i)}>Edit Pending Product</button></>:!r.productId?<button type="button" className="table-action" onClick={()=>openCreate(i)}>Edit New Product Details</button>:null}</td><td><strong>{byId[r.productId]?.barcode||r.pendingProduct?.barcode||r.scannedBarcode||"Missing"}</strong><small>{r.barcodeState}</small><div><button type="button" className="table-action" onClick={()=>{setPhoneScanIndex(null);setScannerIndex(i)}}>Camera This Device</button><button type="button" className="table-action" onClick={()=>armPhoneScan(i)}>Scan with Phone</button>{!byId[r.productId]?.barcode?<button type="button" className="table-action" onClick={()=>r.productId?updateLine(i,"barcodeState","ASSIGN_LATER"):stagePendingProduct(i,"",true)}>Assign Later</button>:null}</div></td><td>{r.pendingProduct?.sizeMl||r.sizeMl||"Review"}</td><td><input value={r.batchNumber||""} onChange={e=>updateLine(i,"batchNumber",e.target.value)} placeholder="Batch / Lot"/><small>{r.batchResolution?.state}</small>{r.batchSuggestionSource==="SHOPAI_VISUAL_SUGGESTION"?<div className="ocr-smart-suggestion ocr-smart-suggestion--compact"><strong>Smart suggestion — check</strong><span>AI prefilled Batch / Lot: {r.batchNumber||"—"}</span><span>Verify against the physical invoice, then Confirm Batch.</span></div>:shopAiReviewSuggestion(shopAiReview,`item:${i}:batch_number`)&&normalize(shopAiReviewSuggestion(shopAiReview,`item:${i}:batch_number`).value)!==normalize(r.batchNumber)?<div className="ocr-smart-suggestion ocr-smart-suggestion--compact"><strong>Smart suggestion — check</strong><span>Batch / Lot: {shopAiReviewSuggestion(shopAiReview,`item:${i}:batch_number`).value}</span><button type="button" className="table-action" onClick={()=>updateLine(i,"batchNumber",shopAiReviewSuggestion(shopAiReview,`item:${i}:batch_number`).value)}>Use suggestion</button></div>:null}{r.batchReviewRequired?<button type="button" className="table-action" onClick={()=>confirmBatch(i)}>Confirm Batch</button>:null}</td><td><input type="number" min="0" step="1" value={r.caseCount} onChange={e=>updateLine(i,"caseCount",e.target.value)}/></td><td><input type="number" min="1" step="1" value={r.unitsPerCase||""} onChange={e=>updateLine(i,"unitsPerCase",e.target.value)}/>{r.packResolution?.source==="PRINTED_BOTTLE_TOTAL"?<small>From invoice OCR</small>:machinePackSuggestion(r.packResolution?.source)?<div className="ocr-smart-suggestion ocr-smart-suggestion--compact"><strong>Smart suggestion — check</strong><span>{r.unitsPerCase} bottles/case</span></div>:<small>Check pack</small>}</td><td><input type="number" min="0" step="1" value={r.looseBottles} onChange={e=>updateLine(i,"looseBottles",e.target.value)}/></td><td><strong>{r.quantity||"Review"}</strong></td><td><input type="number" min="0" step="0.000001" value={r.ratePerCase} onChange={e=>updateLine(i,"ratePerCase",e.target.value)}/></td><td><strong>{Number(r.purchasePrice||0).toFixed(6)}</strong></td><td><input type="number" min="0" step="0.01" value={r.mrp} onChange={e=>updateLine(i,"mrp",e.target.value)}/></td><td><input type="number" min="0" step="0.01" value={r.lineAmount} onChange={e=>updateLine(i,"lineAmount",e.target.value)}/></td><td><span className={`invoice-status-badge ${lineStatus(r,i)==="READY"?"ready":"review"}`}>{lineStatus(r,i)==="READY"?"READY":"NEEDS REVIEW"}</span><small>{lineReasons(r,i)[0]||r.packResolution?.state}</small></td><td><button type="button" className="table-action" onClick={()=>confirmPack(i)}>Confirm Pack</button>{duplicatePending(r,i)?<button type="button" className="table-action" onClick={()=>confirmSeparateDuplicate(i)}>Keep Separate</button>:null}</td></tr>)}</tbody><tfoot><tr><td colSpan="6"><strong>Totals</strong></td><td>{items.reduce((s,r)=>s+Number(r.caseCount||0),0)} cases</td><td>—</td><td>{items.reduce((s,r)=>s+Number(r.looseBottles||0),0)} loose</td><td><strong>{items.reduce((s,r)=>s+Number(r.quantity||0),0)} bottles</strong></td><td colSpan="4"><strong>{money.format(invoiceProductValue)}</strong></td><td colSpan="2">{needsReview} review</td></tr></tfoot></table></div></section></div>
 {financialSummary?.resolutionAssist?.attempted?<section className="panel" style={{marginTop:16}}><h3>OCR Exception Assistance</h3><div className={`verification-guidance ${financialSummary?.resolutionAssist?.unresolved?.length?"verification-guidance--review":"verification-guidance--ok"}`}><strong>{financialSummary?.resolutionAssist?.memoryHits||0} learned mapping(s)</strong> · <strong>{financialSummary?.resolutionAssist?.aiCalled?"AI checked unresolved fields":"AI not needed/called"}</strong> · <strong>{financialSummary?.resolutionAssist?.appliedCount||0} direct-evidence mapping(s) applied</strong>. Review every assisted value before receiving.</div>{(financialSummary?.resolutionAssist?.mappings||[]).length?<div className="muted-text" style={{marginTop:8}}>{(financialSummary.resolutionAssist.mappings||[]).slice(0,12).map(m=>`${m.targetId} ← ${m.rawLabel} (${m.rawValue})${m.applied?" ✓":" · suggestion only"}`).join(" · ")}</div>:null}<p className="muted-text">AI never writes inventory and never invents a missing number. Any field can still be corrected manually below.</p></section>:null}
 <section className="panel" style={{marginTop:16}}><h3>Financial Reconciliation</h3><p className="muted-text">Invoice arithmetic only. Product matching and reviewed product cost do not change this reconciliation.</p><div className="metric-grid four"><div className="metric-card"><span>Invoice Product Value</span><strong>{money.format(invoiceProductValue)}</strong></div><div className="metric-card"><span>Net Adjustments (+/−)</span><strong>{money.format(adjustment)}</strong></div><div className="metric-card"><span>Calculated Invoice Total</span><strong>{money.format(calcTotal)}</strong></div><div className="metric-card"><span>Printed Invoice Total</span><strong>{printed==null?"—":money.format(printed)}</strong></div></div><div className="form-grid" style={{marginTop:12}}>{[["freightAmount","Freight / Carting (+)"],["transportAmount","Transport (+)"],["handlingAmount","Handling (+)"],["loadingUnloadingAmount","Loading / Unloading (+)"],["supplierDiscountAmount","Cash / Supplier Discount (-)"],["invoiceDiscountAmount","Other Discount / Deduction (-)"],["miscellaneousAmount","TCS / Stamp / Other Additions (+)"],["roundingAdjustment","Rounding Adjustment (+/−)"]].map(([k,l])=><label key={k}>{l}<input type="number" step="0.01" value={charges[k]} onChange={e=>setCharges(c=>({...c,[k]:Number(e.target.value||0)}))}/></label>)}</div><div className="form-grid" style={{marginTop:12}}><label>Reviewed Printed Invoice Total<input type="number" min="0" step="0.01" value={financialSummary?.total??""} onChange={e=>setFinancialSummary(s=>({...s,total:e.target.value===""?null:Number(e.target.value),totalSource:"MANUAL"}))}/><small>Manual correction is allowed. Enter this only after visually checking the original invoice; WineShopPOS never derives a missing printed total automatically.</small></label></div><div className={`verification-guidance ${financialReady?"verification-guidance--ok":"verification-guidance--review"}`}>{difference==null?"No printed total; enter the verified printed total manually or leave the invoice in review.":financialReady?`MATCH · difference ${money.format(Math.abs(difference))}`:`BLOCKED · difference ${money.format(Math.abs(difference))}`}</div></section>
 <section className="panel" style={{marginTop:16}}><h3>Product Cost Review</h3><p className="muted-text">Independent product check. This compares invoice line value with reviewed quantities × purchase prices and never changes Financial Reconciliation.</p><div className="metric-grid four"><div className="metric-card"><span>Invoice Product Value</span><strong>{money.format(invoiceProductValue)}</strong></div><div className="metric-card"><span>Reviewed Product Cost</span><strong>{money.format(resolvedProductCost)}</strong></div><div className="metric-card"><span>Cost Gap</span><strong>{money.format(productCostGap)}</strong></div><div className="metric-card"><span>Status</span><strong>{needsReview?"PENDING":Math.abs(productCostGap)<=1?"MATCH":"REVIEW"}</strong></div></div>{needsReview?<div className="verification-guidance verification-guidance--review">Finish product, pack and quantity review to complete Product Cost Review.</div>:Math.abs(productCostGap)<=1?<div className="verification-guidance verification-guidance--ok">MATCH · product cost gap {money.format(Math.abs(productCostGap))}</div>:<div className="verification-guidance verification-guidance--review">REVIEW · product cost gap {money.format(Math.abs(productCostGap))}. Check reviewed quantity and purchase price; Financial Reconciliation remains independent.</div>}</section>
 {ingestionId&&shopAiReview&&!shopAiReady?<section className="panel" style={{marginTop:16}}><h3>Invoice Verification</h3><div className="ocr-smart-suggestion"><strong>Smart suggestion — check</strong><span>Finish checking the original invoice before stock can be received.</span><button type="button" className="secondary-button" disabled={busy} onClick={confirmShopAiReviewInReceiving}>Confirm Invoice Review</button></div></section>:null}
 <section className="panel purchase-receive-footer" style={{marginTop:16}}><div><strong>{ready?"Ready to Receive":"Receive Stock Blocked"}</strong><p className="muted-text">{ready?"All product identity, pack, quantity and financial checks passed.":firstReview||(!financialReady?`Financial reconciliation must match before receiving${difference==null?".":` · difference ${money.format(Math.abs(difference))}.`}`:!supplierName.trim()?"Supplier is required.":!/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate)?"Valid invoice date is required.":invoiceDateReviewRequired?"Invoice date still requires physical confirmation.":"Review remaining purchase checks.")}</p><p className="muted-text">The same Product Master may appear on multiple real invoice rows when commercial values differ. Only identical-looking rows require Keep Separate review.</p><p className="muted-text">New products and missing barcodes are staged from the reviewed row and remain draft-only until this receive succeeds. A failed or cancelled receive leaves Product Master unchanged.</p></div><button type="button" className="primary-button" disabled={busy||!ready} onClick={receive}>{busy?"Receiving / Verifying...":"Approve & Receive Stock"}</button></section>
 <MobileBarcodeScanner open={scannerIndex!=null} title="Scan Product Barcode" onClose={()=>setScannerIndex(null)} onDetected={barcode}/>
 {createIndex!=null&&createForm?<div className="product-image-chooser-backdrop"><section className="product-image-chooser-modal"><div className="product-image-chooser-header"><div><h3>Edit New Product Details</h3><p>Optional: adjust details that could not be verified directly in the receiving row. Nothing is created until Approve & Receive Stock succeeds.</p></div><button type="button" className="secondary-button" onClick={()=>{setCreateIndex(null);setPhoneScanIndex(null)}}>×</button></div><div className="form-grid"><label>Product Name<input value={createForm.productName} onChange={e=>setCreateForm(x=>({...x,productName:e.target.value}))}/></label><label>Brand<input value={createForm.brand} onChange={e=>setCreateForm(x=>({...x,brand:e.target.value}))}/></label><label>Category<select value={createForm.categoryId} onChange={e=>setCreateForm(x=>({...x,categoryId:e.target.value}))}><option value="">Uncategorized</option>{activeCategories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Size (ml)<input type="number" min="1" value={createForm.sizeMl} onChange={e=>setCreateForm(x=>({...x,sizeMl:e.target.value}))}/></label><label>Bottles/Case<input type="number" min="1" value={createForm.unitsPerCase} onChange={e=>setCreateForm(x=>({...x,unitsPerCase:e.target.value}))}/></label><label>MRP<input type="number" min="0" value={createForm.mrp} onChange={e=>setCreateForm(x=>({...x,mrp:e.target.value}))}/></label><label>Barcode optional<input data-scanner-capture="barcode" value={createForm.barcode} onChange={e=>setCreateForm(x=>({...x,barcode:e.target.value}))}/><small>Paired phone: scan now and this field fills automatically. USB scanner also works when this field is focused.</small></label></div><div className="button-row"><button type="button" className="primary-button" disabled={busy} onClick={prepareProduct}>Use on This Purchase</button><button type="button" className="secondary-button" onClick={()=>{setCreateIndex(null);setPhoneScanIndex(null)}}>Cancel</button></div></section></div>:null}
 <section className="panel" style={{marginTop:18}}><h3>Recent Receipts</h3><div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Purchase</th><th>Supplier</th><th>Invoice</th><th>Date</th><th>Units</th><th>Total</th><th>Action</th></tr></thead><tbody>{(purchases||[]).slice(0,20).map(p=><tr key={p.id}><td>{p.purchaseNumber}</td><td>{p.supplierName}</td><td>{p.invoiceNumber}</td><td>{formatIndiaDate(p.invoiceDate)}</td><td>{p.totalUnits}</td><td>{money.format(p.landedTotal??p.total)}</td><td><button type="button" className="secondary-button" onClick={()=>navigate(`/purchasing/receipts/${p.id}`)}>Verify</button></td></tr>)}</tbody></table></div></section></div>;
}
