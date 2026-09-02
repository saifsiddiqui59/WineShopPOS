import { useNavigate, useSearchParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { useShop } from "../context/ShopContext";

export default function AddProduct(){
  const{addProduct}=useShop();
  const navigate=useNavigate();
  const[params]=useSearchParams();
  const barcode=params.get("barcode")||"",fromOcr=params.get("ocr")==="1",line=params.get("ocrLineIndex");
  const ocrMrp=Number(params.get("mrp")||0);
  const requestedSelling=Number(params.get("sellingPrice")||0);
  const initial=(barcode||fromOcr)?{
    barcode,
    name:params.get("name")||"",
    purchasePrice:Number(params.get("purchasePrice")||0),
    sizeMl:Math.max(1,Number(params.get("sizeMl")||750)),
    mrp:Number.isFinite(ocrMrp)?ocrMrp:0,
    price:
      Number.isFinite(requestedSelling)&&requestedSelling>0
        ? requestedSelling
        : Number.isFinite(ocrMrp)&&ocrMrp>0
          ? ocrMrp+15
          : 0,
    unitsPerCase:Math.max(1,Number(params.get("unitsPerCase")||12))
  }:undefined;

  async function save(form){
    const r=await addProduct(form);
    if(r.ok){
      if(fromOcr&&line!==null){
        sessionStorage.setItem("wineshop_ocr_created_product",JSON.stringify({lineIndex:Number(line),productId:r.productId}));
        navigate("/purchasing/ocr");
      }else navigate("/products");
    }
    return r;
  }

  function cancel(){
    if(fromOcr) navigate("/purchasing/ocr");
    else navigate("/products");
  }

  return <div>
    <div className="page-heading">
      <div><h2>Add Product</h2><p>{fromOcr?"Create the unmatched OCR product. Saving returns to the invoice review and links this line.":barcode?"Unknown scanned barcode has been prefilled.":"Create product directly in Supabase"}</p></div>
      <div className="button-row">
        <button type="button" className="secondary-button" onClick={()=>navigate(-1)}>← Back</button>
        <button type="button" className="secondary-button" onClick={cancel}>× Close</button>
      </div>
    </div>
    <ProductForm
      key={`${barcode}-${params.get("name")||""}-${fromOcr}`}
      initialValue={initial}
      onSubmit={save}
      onCancel={cancel}
      submitLabel={fromOcr?"Create & Return to OCR":"Create Product"}
    />
  </div>;
}
