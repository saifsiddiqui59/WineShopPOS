import {
  ArrowLeft,
  PackagePlus,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import ProductForm from "../components/ProductForm";

import {
  useShop,
} from "../context/ShopContext";

export default function AddProduct() {
  const {
    addProduct,
  } = useShop();

  const navigate =
    useNavigate();

  const handleSubmit =
    (form) => {
      const result =
        addProduct(form);

      if (!result.ok) {
        window.alert(
          result.message
        );

        return;
      }

      navigate(
        "/products",
        {
          state: {
            message:
              result.message,
          },
        }
      );
    };

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
            Add New Product
          </h2>

          <p>
            Create product master and
            opening inventory
          </p>
        </div>

        <div className="receive-heading-icon">
          <PackagePlus
            size={20}
          />

          New SKU
        </div>
      </div>

      <ProductForm
        showOpeningStock
        submitLabel="Save Product & Opening Stock"
        onSubmit={
          handleSubmit
        }
      />
    </div>
  );
}
