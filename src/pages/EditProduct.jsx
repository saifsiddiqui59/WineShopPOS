import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { finalizeProductEnrichment } from "../lib/productEnrichmentClient";

const moneyNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(2)) : 0;
};

export default function EditProduct() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { products, updateProduct, loadingData } = useShop();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const product = products.find((item) => item.id === id);
  const fromOcr = params.get("ocr") === "1";
  const returnPath = fromOcr ? "/purchasing/ocr" : "/products";

  if (loadingData && !product) return <div className="panel">Loading...</div>;
  if (!product) return <Navigate to={returnPath} replace />;

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

    const selection = form.enrichmentSelection;
    if (selection?.confirmationCacheKey && selection?.outcome !== "MANUAL") {
      try {
        await finalizeProductEnrichment({
          shopId: profile?.shop_id,
          productId: id,
          confirmationCacheKey: selection.confirmationCacheKey,
          candidateId: selection.candidateId || null,
          importImage: Boolean(selection.importImage),
        });
      } catch (enrichmentError) {
        return {
          ok: false,
          message:
            `Product details were saved, but enrichment finalization failed: ` +
            `${enrichmentError?.message || String(enrichmentError)}. Retry Verify Product / Barcode if you still want external evidence finalization.`,
        };
      }
    }

    navigate(returnPath);
    return result;
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Edit Product</h2>
          <p>
            {fromOcr
              ? "Edit this Product Master item, then Save or Cancel to return to the same OCR invoice review."
              : "Stock is not changed by editing or enriching product details"}
          </p>
        </div>
      </div>
      <ProductForm
        initialValue={product}
        onSubmit={saveAndClose}
        onCancel={() => navigate(returnPath)}
        submitLabel={fromOcr ? "Save & Return to OCR" : "Save & Close"}
      />
    </div>
  );
}
