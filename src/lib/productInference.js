import { normalizeOcrEvidenceText } from "./ocrLearningRules.js";

function n(v){
  return normalizeOcrEvidenceText(v, { context: "PRODUCT" })
    .toLowerCase()
    .replace(/&/g," and ")
    .replace(/[^a-z0-9]+/g," ")
    .trim()
    .replace(/\s+/g," ");
}

export function inferBrandFromProductName(name){
  const learned = normalizeOcrEvidenceText(name, { context: "PRODUCT" });
  return String(learned||"").trim().split(/\s+/)[0]?.replace(/^[^a-z0-9]+|[^a-z0-9&'-]+$/gi,"")||"";
}

const beer=new Set(["tuborg","carlsberg","kingfisher","budweiser","heineken","corona","bira","hoegaarden","becks","haywards","fosters"]);
const legacyBeerOcrVariant=/\b(lagar|larger)\b/i;

function keyword(d){
  const raw=String(d||"");
  const t=n(d),b=n(inferBrandFromProductName(d));
  if(legacyBeerOcrVariant.test(raw)||/\b(beer|lager|stout|ale|pilsner|witbier)\b/.test(t)||beer.has(b))return"beer";
  if(/\b(whisky|whiskey|scotch|bourbon)\b/.test(t))return"whisky";
  for(const k of ["rum","vodka","gin","brandy","tequila","wine","cider"])if(new RegExp(`\\b${k}\\b`).test(t))return k;
  if(/\b(breezer|rtd|ready to drink)\b/.test(t))return"rtd";
  return"";
}

export function inferCategoryId(d,categories=[]){
  const k=keyword(d);
  if(!k)return"";
  const a=(categories||[]).filter(x=>x?.active!==false);
  const exact=a.find(x=>n(x?.name)===k);
  if(exact)return exact.id;
  const fuzzy=a.find(x=>{
    const z=n(x?.name);
    if(k==="whisky")return z.includes("whisky")||z.includes("whiskey");
    if(k==="rtd")return z.includes("rtd")||z.includes("ready to drink");
    return z.includes(k);
  });
  return fuzzy?.id||"";
}

export function normalizeBeerOcrText(value){
  return normalizeOcrEvidenceText(value, { context: "BEER_PRODUCT" });
}
