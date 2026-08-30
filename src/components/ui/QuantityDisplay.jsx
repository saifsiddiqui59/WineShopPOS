export default function QuantityDisplay({value=0,unit="bottles"}){return <span>{Number(value||0).toLocaleString("en-IN")} {unit}</span>}
