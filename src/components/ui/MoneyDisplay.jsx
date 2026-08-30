const formatter=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
export default function MoneyDisplay({value=0}){return <span>{formatter.format(Number(value||0))}</span>}
