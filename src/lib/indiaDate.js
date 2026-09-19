export function formatIndiaDate(iso){
  const text=String(iso||"");
  const m=text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m?`${m[3]}/${m[2]}/${m[1]}`:"";
}

export function parseIndiaDate(value){
  const digits=String(value||"").replace(/\D/g,"").slice(0,8);
  if(digits.length!==8)return "";
  const day=Number(digits.slice(0,2));
  const month=Number(digits.slice(2,4));
  const year=Number(digits.slice(4,8));
  if(year<2000||year>2099||month<1||month>12||day<1||day>31)return "";
  const date=new Date(Date.UTC(year,month-1,day));
  if(
    date.getUTCFullYear()!==year||
    date.getUTCMonth()+1!==month||
    date.getUTCDate()!==day
  )return "";
  return `${String(year).padStart(4,"0")}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

export function formatIndiaDateEntry(value){
  const digits=String(value||"").replace(/\D/g,"").slice(0,8);
  if(digits.length<=2)return digits;
  if(digits.length<=4)return `${digits.slice(0,2)}/${digits.slice(2)}`;
  return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
}
