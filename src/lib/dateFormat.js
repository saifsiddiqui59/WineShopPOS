function isoParts(value) {
  const m=String(value||"").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m?{year:m[1],month:m[2],day:m[3]}:null;
}
export function formatDateIN(value,fallback="—"){
  if(!value)return fallback;
  const p=isoParts(value);
  if(p)return `${p.day}/${p.month}/${p.year}`;
  const d=new Date(value);
  if(!Number.isFinite(d.getTime()))return String(value);
  const parts=new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"}).formatToParts(d);
  const map=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return `${map.day}/${map.month}/${map.year}`;
}
export function formatDateTimeIN(value,fallback="—"){
  if(!value)return fallback;
  const d=new Date(value);
  if(!Number.isFinite(d.getTime()))return String(value);
  const day=new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
  const time=new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true}).format(d);
  return `${day}, ${time}`;
}
