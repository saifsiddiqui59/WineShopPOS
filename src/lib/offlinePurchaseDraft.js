const DB_NAME="wineshoppos_purchase_drafts_v1",DB_VERSION=1,DRAFT_STORE="purchase_drafts",KEY_STORE="crypto_keys",KEY_ID="purchase-draft-aes-key";
export const DRAFT_GUARD_MARKER="V5_24_EMPTY_MANUAL_DRAFT_GUARD";

const reqPromise=req=>new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
const txPromise=tx=>new Promise((resolve,reject)=>{
  tx.oncomplete=()=>resolve();
  tx.onerror=()=>reject(tx.error||new Error("IndexedDB transaction failed."));
  tx.onabort=()=>reject(tx.error||new Error("IndexedDB transaction aborted."));
});

function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(DRAFT_STORE)){
        const s=db.createObjectStore(DRAFT_STORE,{keyPath:"id"});
        s.createIndex("updatedAt","updatedAt");
      }
      if(!db.objectStoreNames.contains(KEY_STORE))db.createObjectStore(KEY_STORE,{keyPath:"id"});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function key(){
  if(!globalThis.crypto?.subtle||typeof indexedDB==="undefined")
    throw new Error("Secure offline purchase drafts are unavailable in this browser.");
  const db=await openDb();
  try{
    const tx=db.transaction(KEY_STORE,"readwrite"),s=tx.objectStore(KEY_STORE),old=await reqPromise(s.get(KEY_ID));
    if(old?.key)return old.key;
    const k=await crypto.subtle.generateKey({name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
    s.put({id:KEY_ID,key:k});
    return k;
  }finally{db.close();}
}

const b64=b=>{let s="";for(const x of b)s+=String.fromCharCode(x);return btoa(s);};
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));

async function encrypt(payload){
  const k=await key(),iv=crypto.getRandomValues(new Uint8Array(12)),plain=new TextEncoder().encode(JSON.stringify(payload)),cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv},k,plain);
  return{iv:b64(iv),cipher:b64(new Uint8Array(cipher))};
}

async function decrypt(row){
  const k=await key(),plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytes(row.iv)},k,bytes(row.cipher));
  return JSON.parse(new TextDecoder().decode(plain));
}

function nonZeroObject(value){
  if(!value||typeof value!=="object")return false;
  return Object.values(value).some(v=>Number.isFinite(Number(v))&&Math.abs(Number(v))>0.000001);
}

export function isMeaningfulPurchaseDraft(payload){
  if(!payload||typeof payload!=="object")return false;

  if([
    payload.supplierId,
    payload.supplierName,
    payload.invoiceNumber,
    payload.invoiceDate,
    payload.notes,
  ].some(v=>String(v||"").trim()))return true;

  if(Array.isArray(payload.items)&&payload.items.length>0)return true;
  if(nonZeroObject(payload.charges))return true;
  if(nonZeroObject(payload.financialSummary))return true;

  return false;
}

export async function saveOfflinePurchaseDraft(id,payload){
  if(!id)return{saved:false,reason:"NO_DRAFT_ID"};

  // Opening a blank manual Receive Stock page must never create a draft.
  if(!isMeaningfulPurchaseDraft(payload)){
    await removeOfflinePurchaseDraft(id).catch(()=>{});
    return{saved:false,reason:DRAFT_GUARD_MARKER};
  }

  const enc=await encrypt(payload),db=await openDb();
  try{
    const tx=db.transaction(DRAFT_STORE,"readwrite");
    const done=txPromise(tx);
    tx.objectStore(DRAFT_STORE).put({
      id,
      updatedAt:new Date().toISOString(),
      ...enc
    });
    await done;
    return{saved:true};
  }finally{db.close();}
}

export async function loadOfflinePurchaseDraft(id){
  if(!id)return null;
  const db=await openDb();
  try{
    const row=await reqPromise(db.transaction(DRAFT_STORE,"readonly").objectStore(DRAFT_STORE).get(id));
    return row?{...row,payload:await decrypt(row)}:null;
  }finally{db.close();}
}

export async function removeOfflinePurchaseDraft(id){
  if(!id)return;
  const db=await openDb();
  try{
    const tx=db.transaction(DRAFT_STORE,"readwrite");
    const done=txPromise(tx);
    tx.objectStore(DRAFT_STORE).delete(id);
    await done;
  }finally{db.close();}
}

export async function countOfflinePurchaseDrafts(){
  const db=await openDb();
  try{
    return await reqPromise(db.transaction(DRAFT_STORE,"readonly").objectStore(DRAFT_STORE).count());
  }finally{db.close();}
}

/**
 * Remove only decryptable, truly-empty MANUAL drafts created by the old bug.
 * Meaningful drafts and ingestion-linked drafts are always preserved.
 * Rows that cannot be decrypted are preserved for inspection.
 */
export async function pruneEmptyManualPurchaseDrafts(){
  const db=await openDb();
  let rows=[];
  try{
    rows=await reqPromise(db.transaction(DRAFT_STORE,"readonly").objectStore(DRAFT_STORE).getAll());
  }finally{db.close();}

  const removable=[];
  for(const row of rows||[]){
    if(!String(row?.id||"").startsWith("manual:"))continue;
    try{
      const payload=await decrypt(row);
      if(!isMeaningfulPurchaseDraft(payload))removable.push(row.id);
    }catch{
      // Unknown/corrupt/undecryptable rows are intentionally preserved.
    }
  }

  if(!removable.length)return 0;

  const writeDb=await openDb();
  try{
    const tx=writeDb.transaction(DRAFT_STORE,"readwrite");
    const store=tx.objectStore(DRAFT_STORE);
    for(const draftId of removable)store.delete(draftId);
    await new Promise((resolve,reject)=>{
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error||new Error("Draft cleanup transaction aborted."));
    });
  }finally{writeDb.close();}

  return removable.length;
}
