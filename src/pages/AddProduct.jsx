import { useNavigate, useSearchParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { useShop } from "../context/ShopContext";

export default function AddProduct(){const{addProduct}=useShop();const navigate=useNavigate();const[params]=useSearchParams();const barcode=params.get("barcode")||"";async function save(form){const r=await addProduct(form);if(r.ok)navigate("/products");return r}return <div><div className="page-heading"><div><h2>Add Product</h2><p>{barcode?"Unknown scanned barcode has been prefilled.":"Create product directly in Supabase"}</p></div></div><ProductForm key={barcode||"new"} initialValue={barcode?{barcode}:undefined} showOpeningStock onSubmit={save} submitLabel="Create Product"/></div>}
