import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { supabase } from "../lib/supabase";
import Receipt80mm from "../components/Receipt80mm";

const SALE_SELECT = `
  id,invoice_number,subtotal,discount,grand_total,cashier_id,status,created_at,
  sale_items(id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,line_total,fifo_unit_cost,fifo_line_cost),
  payments(id,payment_method,amount,reference_number,payment_type,created_at)
`;

function normalizeSale(row){
  const payment=(row?.payments||[]).find((p)=>p.payment_type!=="REFUND")||row?.payments?.[0]||null;
  return {
    id:row.id, invoiceNumber:row.invoice_number, createdAt:row.created_at, cashierId:row.cashier_id,
    status:row.status, paymentMethod:payment?.payment_method||"", paymentReference:payment?.reference_number||"",
    subtotal:Number(row.subtotal||0), discount:Number(row.discount||0), grandTotal:Number(row.grand_total||0),
    items:(row.sale_items||[]).map((i)=>({id:i.id,productId:i.product_id,productName:i.product_name_snapshot||"Product",barcode:i.barcode_snapshot||"",quantity:Number(i.quantity||0),unitPrice:Number(i.unit_price||0),lineTotal:Number(i.line_total||0),purchasePrice:Number(i.fifo_unit_cost||0),fifoLineCost:Number(i.fifo_line_cost||0)}))
  };
}

export default function SaleDetails(){
  const{id}=useParams();
  const[params]=useSearchParams();
  const{sales,loadingData}=useShop();
  const cached=sales.find((s)=>s.id===id);
  const[remote,setRemote]=useState(null);
  const[remoteLoading,setRemoteLoading]=useState(!cached);
  const[error,setError]=useState("");
  const printed=useRef(false);
  const sale=cached||remote;
  const printRequested=params.get("print")==="1";

  useEffect(()=>{
    if(!id||cached){setRemoteLoading(false);return undefined;}
    let cancelled=false;
    setRemoteLoading(true);setError("");
    supabase.from("sales").select(SALE_SELECT).eq("id",id).single().then(({data,error:queryError})=>{
      if(cancelled)return;
      if(queryError||!data){setError(queryError?.message||"Completed sale could not be loaded.");setRemote(null);}
      else setRemote(normalizeSale(data));
    }).finally(()=>{if(!cancelled)setRemoteLoading(false)});
    return()=>{cancelled=true};
  },[id,cached]);

  useEffect(()=>{
    if(!sale||!printRequested||printed.current)return undefined;
    printed.current=true;
    const timer=window.setTimeout(()=>window.print(),700);
    return()=>window.clearTimeout(timer);
  },[sale,printRequested]);

  if(!sale&&(loadingData||remoteLoading))return <div className="panel">Loading completed sale and receipt...</div>;
  if(!sale)return <div className="panel"><h2>Receipt unavailable</h2><p>{error||"Sale was not found for this shop."}</p><Link className="secondary-button" to="/pos/sales">Back to Sales</Link></div>;

  return <div className="invoice-page">
    <div className="page-heading no-print">
      <div><h2>Invoice {sale.invoiceNumber}</h2><p>80mm thermal receipt layout{printRequested?" · Print dialog opens automatically":""}</p></div>
      <div className="button-row"><Link className="secondary-button" to="/pos/sales">Sales</Link><button className="primary-button" onClick={()=>window.print()}>Print Receipt</button></div>
    </div>
    <Receipt80mm sale={sale}/>
  </div>;
}
