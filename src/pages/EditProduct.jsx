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

  async function saveAndClose(form) {
    const result = await updateProduct(id, form);
    if (result.ok) navigate("/products");
    return result;
  }

  async function apply(form) {
    return updateProduct(id, form);
  }

  return (
    <div>
      <div className="page-heading">
        <div><h2>Edit Product</h2><p>Stock is not changed by editing product details</p></div>
        <div className="button-row">
          <button type="button" className="secondary-button" onClick={() => navigate(-1)}>← Back</button>
          <button type="button" className="secondary-button" onClick={() => navigate("/products")}>× Close</button>
        </div>
      </div>
      <ProductForm
        initialValue={product}
        onSubmit={saveAndClose}
        onApply={apply}
        onCancel={() => navigate("/products")}
        submitLabel="Save & Close"
      />
    </div>
  );
}
