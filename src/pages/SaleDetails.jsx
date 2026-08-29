import { Navigate, useParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import Receipt80mm from "../components/Receipt80mm";

export default function SaleDetails(){const{id}=useParams();const{sales,loadingData}=useShop();const sale=sales.find((s)=>s.id===id);if(loadingData)return <div className="panel">Loading...</div>;if(!sale)return <Navigate to="/sales" replace/>;return <div className="invoice-page"><div className="page-heading no-print"><div><h2>Invoice {sale.invoiceNumber}</h2><p>80mm thermal receipt layout</p></div><button className="primary-button" onClick={()=>window.print()}>Print Receipt</button></div><Receipt80mm sale={sale}/></div>}
