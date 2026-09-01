import { Children, cloneElement, isValidElement, useState } from "react";

function textOf(node){
  if(node==null||typeof node==="boolean")return"";
  if(typeof node==="string"||typeof node==="number")return String(node);
  if(Array.isArray(node))return node.map(textOf).join(" ");
  if(!isValidElement(node))return"";
  if(["input","select","textarea"].includes(node.type))return String(node.props?.value??"");
  return textOf(node.props?.children);
}
function comparable(value){
  const text=String(value||"").replace(/\s+/g," ").trim();
  const numeric=text.replace(/[₹$€£,%]/g,"").replace(/,/g,"").trim();
  if(/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(numeric))return{kind:"number",value:Number(numeric)};
  if(/^\d{4}-\d{2}-\d{2}/.test(text)||/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(text)||/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(text)){
    const t=Date.parse(text);if(Number.isFinite(t))return{kind:"number",value:t};
  }
  return{kind:"text",value:text};
}
function compare(a,b){const x=comparable(a),y=comparable(b);if(x.kind==="number"&&y.kind==="number")return x.value-y.value;return String(x.value).localeCompare(String(y.value),"en",{numeric:true,sensitivity:"base"});}
function cellText(row,index){if(!isValidElement(row))return"";return textOf(Children.toArray(row.props?.children)[index]);}
function sortable(th){if(!isValidElement(th)||th.props?.["data-sort"]==="false")return false;const label=textOf(th.props?.children).trim();return Boolean(label)&&!/^(action|actions|view|details)$/i.test(label);}

export default function SortableTable({children,...props}){
  const[sort,setSort]=useState({column:null,direction:"asc"});
  const parts=Children.toArray(children);
  const hi=parts.findIndex((x)=>isValidElement(x)&&x.type==="thead");
  const bi=parts.findIndex((x)=>isValidElement(x)&&x.type==="tbody");
  if(hi<0||bi<0)return <table {...props}>{children}</table>;
  const head=parts[hi],body=parts[bi];
  const headRows=Children.toArray(head.props.children).map((row)=>{
    if(!isValidElement(row)||row.type!=="tr")return row;
    const headers=Children.toArray(row.props.children).map((th,column)=>{
      if(!sortable(th))return th;
      const active=sort.column===column;const arrow=!active?"↕":sort.direction==="asc"?"↑":"↓";
      return cloneElement(th,th.props,<button type="button" className={`table-sort-button${active?" active":""}`} onClick={()=>setSort((s)=>({column,direction:s.column===column&&s.direction==="asc"?"desc":"asc"}))}><span>{th.props.children}</span><span className="table-sort-arrow" aria-hidden="true">{arrow}</span></button>);
    });
    return cloneElement(row,row.props,headers);
  });
  const rows=Children.toArray(body.props.children);
  if(sort.column!=null)rows.sort((a,b)=>{const c=compare(cellText(a,sort.column),cellText(b,sort.column));return sort.direction==="asc"?c:-c});
  const next=[...parts];next[hi]=cloneElement(head,head.props,headRows);next[bi]=cloneElement(body,body.props,rows);
  return <table {...props}>{next}</table>;
}
