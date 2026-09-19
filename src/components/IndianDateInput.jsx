import { useEffect,useRef,useState } from "react";
import { formatIndiaDate,formatIndiaDateEntry,parseIndiaDate } from "../lib/indiaDate";

export default function IndianDateInput({value,onChange,...props}){
  const focused=useRef(false);
  const[text,setText]=useState(()=>formatIndiaDate(value));

  useEffect(()=>{
    if(!focused.current)setText(formatIndiaDate(value));
  },[value]);

  return <input
    {...props}
    type="text"
    inputMode="numeric"
    autoComplete="off"
    placeholder="DD/MM/YYYY"
    value={text}
    onFocus={()=>{focused.current=true}}
    onChange={(event)=>{
      const next=formatIndiaDateEntry(event.target.value);
      setText(next);
      onChange?.(parseIndiaDate(next));
    }}
    onBlur={()=>{
      focused.current=false;
      const iso=parseIndiaDate(text);
      if(!iso)setText(formatIndiaDate(value));
    }}
    title="Enter date as DD/MM/YYYY"
  />;
}
