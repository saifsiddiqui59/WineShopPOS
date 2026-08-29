import { useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { useShop } from "../context/ShopContext";

export default function AddProduct() {
  const { addProduct } = useShop();
  const navigate = useNavigate();

  async function save(form) {
    const result = await addProduct(form);
    if (result.ok) navigate("/products");
    return result;
  }

  return (
    <div>
      <div className="page-heading"><div><h2>Add Product</h2><p>Create product directly in Supabase</p></div></div>
      <ProductForm showOpeningStock onSubmit={save} submitLabel="Create Product" />
    </div>
  );
}
