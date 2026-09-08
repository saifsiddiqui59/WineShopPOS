import { useNavigate, useSearchParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { useShop } from "../context/ShopContext";
import {
  autoFindProductImage,
  finalizeProductEnrichment,
} from "../lib/productEnrichmentClient";
import { useAuth } from "../context/AuthContext";

export default function AddProduct() {
  const { addProduct, refreshAll } = useShop();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const barcode = params.get("barcode") || "";
  const fromOcr = params.get("ocr") === "1";
  const line = params.get("ocrLineIndex");
  const ocrMrp = Number(params.get("mrp") || 0);
  const requestedSelling = Number(params.get("sellingPrice") || 0);
  const requestedSize = Number(params.get("sizeMl") || 0);

  const enrichmentSelection =
    params.get("enrichmentCacheKey") && barcode
      ? {
          outcome: params.get("enrichmentOutcome") || "UNVERIFIED",
          physicalBarcode: barcode,
          confirmationCacheKey: params.get("enrichmentCacheKey"),
          candidateId: params.get("enrichmentCandidateId") || null,
          candidate: null,
          importImage: params.get("enrichmentImportImage") === "1",
        }
      : null;

  const initial = (barcode || fromOcr)
    ? {
        barcode,
        name: params.get("name") || "",
        brand: params.get("brand") || "",
        category: params.get("category") || "Other",
        purchasePrice: Number(params.get("purchasePrice") || 0),
        sizeMl: Number.isFinite(requestedSize) && requestedSize > 0 ? Math.round(requestedSize) : "",
        mrp: Number.isFinite(ocrMrp) ? ocrMrp : 0,
        price:
          Number.isFinite(requestedSelling) && requestedSelling > 0
            ? requestedSelling
            : Number.isFinite(ocrMrp) && ocrMrp > 0
              ? ocrMrp + 15
              : 0,
        unitsPerCase: Math.max(1, Number(params.get("unitsPerCase") || 12)),
        lookupPackageType: params.get("packageType") || "",
        enrichmentSelection,
      }
    : undefined;

  async function save(form) {
    const result = await addProduct(form);
    if (!result.ok) return result;

    let enrichmentWarning = "";
    let imageFinalizedBySelection = false;
    const selection = form.enrichmentSelection;

    if (
      selection?.confirmationCacheKey &&
      selection?.outcome !== "MANUAL"
    ) {
      try {
        await finalizeProductEnrichment({
          shopId: profile?.shop_id,
          productId: result.productId,
          confirmationCacheKey: selection.confirmationCacheKey,
          candidateId: selection.candidateId || null,
          importImage: Boolean(selection.importImage),
        });

        imageFinalizedBySelection = Boolean(selection.importImage);
        if (imageFinalizedBySelection) await refreshAll();
      } catch (error) {
        enrichmentWarning =
          `Product was saved, but enrichment finalization did not complete: ${error?.message || String(error)}`;
      }
    }

    const hasExplicitImage = Boolean(form.imageFile || form.imagePath);

    if (
      !hasExplicitImage &&
      !imageFinalizedBySelection &&
      profile?.shop_id &&
      result.productId
    ) {
      try {
        const imageResult = await autoFindProductImage({
          shopId: profile.shop_id,
          productId: result.productId,
          replace: false,
        });

        if (imageResult?.barcodeUnchanged !== true) {
          throw new Error("Product Image barcode-safety verification failed.");
        }

        await refreshAll();
      } catch (error) {
        enrichmentWarning = enrichmentWarning
          ? enrichmentWarning + " Automatic Product Image lookup also did not complete."
          : "Product was saved. Automatic Product Image lookup did not complete; use Products -> Edit -> Try Another Image or upload an image later.";
      }
    }

    if (enrichmentWarning) window.alert(enrichmentWarning);

    if (fromOcr && line !== null) {
      sessionStorage.setItem(
        "wineshop_ocr_created_product",
        JSON.stringify({
          lineIndex: Number(line),
          productId: result.productId,
          productName: form.name || params.get("name") || "Newly created product",
        }),
      );
      navigate("/purchasing/ocr");
    } else {
      navigate("/products");
    }
    return result;
  }

  function cancel() {
    if (fromOcr) navigate("/purchasing/ocr");
    else navigate("/products");
  }

  const enriched = params.get("enriched") === "1";
  const enrichmentSources = params.get("enrichmentSources") || "";

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Add Product</h2>
          <p>
            {fromOcr
              ? "Create the unmatched OCR product. Saving returns to invoice review and links this line."
              : barcode
                ? "Physically scanned barcode has been prefilled."
                : "Create product directly in Supabase"}
          </p>
        </div>
        <div className="button-row">
          <button type="button" className="secondary-button" onClick={() => navigate(-1)}>← Back</button>
          <button type="button" className="secondary-button" onClick={cancel}>× Close</button>
        </div>
      </div>

      {enriched ? (
        <div className="purchase-message" style={{ marginBottom: 12 }}>
          Product suggestion selected from <strong>{enrichmentSources || "product lookup"}</strong>.
          The barcode below is the <strong>physical scan</strong>, not an internet-suggested barcode.
          Review Product Master values before saving.
        </div>
      ) : fromOcr && !barcode ? (
        <div className="verification-guidance verification-guidance--neutral" style={{ marginBottom: 12 }}>
          OCR product details are prefilled. Product Image preview loads automatically from the product identity. A physical barcode is still required to save; after save the same Product Master automatic image workflow used on the Products page runs when no image was explicitly chosen.
        </div>
      ) : null}

      <ProductForm
        key={`${barcode}-${params.get("name") || ""}-${fromOcr}`}
        initialValue={initial}
        onSubmit={save}
        onCancel={cancel}
        submitLabel={fromOcr ? "Create & Return to OCR" : "Create Product"}
      />
    </div>
  );
}
