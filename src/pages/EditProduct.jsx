import { Navigate, useNavigate, useParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { useShop } from "../context/ShopContext";

export default function EditProduct() {
  const { id } = useParams();
  const { products, updateProduct, loadingData } = useShop();
  const navigate = useNavigate();

  const product = products.find((item) => item.id === id);

  if (loadingData) return <div className="panel">Loading...</div>;
  if (!product) return <Navigate to="/products" replace />;

  async function save(form) {
    const result = await updateProduct(id, form);
    if (result.ok) navigate("/products");
    return result;
  }

  return (
    <div>
      <div className="page-heading"><div><h2>Edit Product</h2><p>Stock is not changed by editing product details</p></div></div>
      <ProductForm initialValue={product} onSubmit={save} submitLabel="Save Changes" />
    </div>
  );
}
