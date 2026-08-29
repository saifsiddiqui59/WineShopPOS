import {
  ArrowLeft,
  CircleCheck,
  CircleOff,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useState,
} from "react";

import ProductForm from "../components/ProductForm";

import {
  useShop,
} from "../context/ShopContext";

export default function EditProduct() {
  const {
    id,
  } = useParams();

  const {
    products,
    getStock,
    updateProduct,
    deactivateProduct,
    activateProduct,
  } = useShop();

  const [
    message,
    setMessage,
  ] = useState("");

  const product =
    products.find(
      (item) =>
        item.id === id
    );

  if (!product) {
    return (
      <div className="panel">
        Product not found.
      </div>
    );
  }

  const initialValues = {
    barcode:
      product.barcode,

    sku:
      product.sku,

    name:
      product.name,

    brand:
      product.brand,

    category:
      product.category,

    sizeMl:
      product.sizeMl ??
      Number.parseInt(
        product.size,
        10
      ),

    alcoholPercentage:
      product.alcoholPercentage ??
      "",

    purchasePrice:
      product.purchasePrice,

    mrp:
      product.mrp ??
      product.price,

    price:
      product.price,

    minimumStock:
      product.minimumStock,

    unitsPerCase:
      product.unitsPerCase,
  };

  function handleSubmit(
    form
  ) {
    const result =
      updateProduct(
        product.id,
        form
      );

    if (!result.ok) {
      window.alert(
        result.message
      );

      return;
    }

    setMessage(
      result.message
    );
  }

  function handleStatus() {
    const result =
      product.active ===
      false
        ? activateProduct(
            product.id
          )
        : deactivateProduct(
            product.id
          );

    setMessage(
      result.message
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <Link
            className="back-link"
            to="/products"
          >
            <ArrowLeft
              size={16}
            />

            Products
          </Link>

          <h2>
            Edit Product
          </h2>

          <p>
            {product.name}
          </p>
        </div>

        <div className="product-edit-status">
          <span
            className={
              product.active ===
              false
                ? "product-status inactive"
                : "product-status active"
            }
          >
            {product.active ===
            false
              ? "INACTIVE"
              : "ACTIVE"}
          </span>

          <strong>
            Stock:{" "}
            {getStock(
              product.id
            )}
          </strong>
        </div>
      </div>

      {message && (
        <div className="purchase-message success">
          {message}
        </div>
      )}

      <ProductForm
        key={
          product.updatedAt ??
          product.id
        }
        initialValues={
          initialValues
        }
        submitLabel="Save Product Changes"
        onSubmit={
          handleSubmit
        }
      />

      <section className="panel product-status-panel">
        <div>
          <h3>
            Product Status
          </h3>

          <p>
            Inactive products remain in
            history and inventory but cannot
            be sold or received.
          </p>
        </div>

        <button
          type="button"
          className={
            product.active ===
            false
              ? "activate-product-button"
              : "deactivate-product-button"
          }
          onClick={
            handleStatus
          }
        >
          {product.active ===
          false ? (
            <CircleCheck
              size={18}
            />
          ) : (
            <CircleOff
              size={18}
            />
          )}

          {product.active ===
          false
            ? "Activate Product"
            : "Deactivate Product"}
        </button>
      </section>
    </div>
  );
}
