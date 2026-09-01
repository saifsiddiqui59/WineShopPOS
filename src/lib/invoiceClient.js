const DEFAULT_INVOICE_API = "https://wsp-v3-invoice-53b6e9a1.azurewebsites.net";
const API_BASE = String(import.meta.env.VITE_INVOICE_API_URL || DEFAULT_INVOICE_API).replace(/\/+$/, "");
function requireBase(){if(!API_BASE)throw new Error("Invoice document storage API is not configured for this deployment.");return API_BASE;}
async function postJson(path,token,body){if(!token)throw new Error("Sign in again to access invoice documents.");const r=await fetch(`${requireBase()}${path}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify(body)});let p={};try{p=await r.json();}catch{}if(!r.ok)throw new Error(p?.error||"Invoice document operation failed.");return p;}
export function storeManualInvoice({token,fileName,contentType,contentBase64}){return postJson("/api/invoice/manual-store",token,{file_name:fileName,content_type:contentType,content_base64:contentBase64});}
export function getInvoiceReadUrl({token,ingestionId}){return postJson("/api/invoice/read-url",token,{ingestion_id:ingestionId});}
