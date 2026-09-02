import { Navigate, useNavigate, useParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { useShop } from "../context/ShopContext";
import { supabase } from "../lib/supabase";

const moneyNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(2)) : 0;
};

export default function EditProduct() {
  const { id } = useParams();
  const { products, updateProduct, loadingData } = useShop();
  const navigate = useNavigate();
  const product = products.find((item) => item.id === id);

  if (loadingData && !product) return <div className="panel">Loading...</div>;
  if (!product) return <Navigate to="/products" replace />;

  async function saveAndClose(form) {
    const result = await updateProduct(id, form);
    if (!result.ok) return result;

    const { data, error } = await supabase.rpc("get_products");
    if (error) {
      return {
        ok: false,
        message: `Product was saved, but the Selling Price could not be verified: ${error.message}`,
      };
    }

    const saved = (data || []).find((item) => item.id === id);
    if (!saved) {
      return {
        ok: false,
        message: "Product was saved, but it could not be reloaded for verification.",
      };
    }

    const expectedPrice = moneyNumber(form.price);
    const persistedPrice = moneyNumber(saved.selling_price);
    if (Math.abs(expectedPrice - persistedPrice) > 0.001) {
      return {
        ok: false,
        message: `Selling Price did not persist correctly. Entered ₹${expectedPrice.toFixed(2)}, saved ₹${persistedPrice.toFixed(2)}. Please retry.`,
      };
    }

    navigate("/products");
    return result;
  }

  return (
    <div>
      <div className="page-heading">
        <div><h2>Edit Product</h2><p>Stock is not changed by editing product details</p></div>
      </div>
      <ProductForm
        initialValue={product}
        onSubmit={saveAndClose}
        onCancel={() => navigate("/products")}
        submitLabel="Save & Close"
      />
    </div>
  );
}
