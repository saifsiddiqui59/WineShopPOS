import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  Pencil,
  Plus,
  Search,
} from "lucide-react";

import {
  useShop,
} from "../context/ShopContext";

const money =
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  );

export default function Products() {
  const {
    products,
    getStock,
  } = useShop();

  const location =
    useLocation();

  const [
    search,
    setSearch,
  ] = useState("");

  const filteredProducts =
    useMemo(() => {
      const value =
        search
          .toLowerCase()
          .trim();

      if (!value) {
        return products;
      }

      return products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(value) ||
          product.brand
            .toLowerCase()
            .includes(value) ||
          product.category
            .toLowerCase()
            .includes(value) ||
          product.barcode
            .includes(value) ||
          product.sku
            .toLowerCase()
            .includes(value)
      );
    }, [
      products,
      search,
    ]);

  const activeCount =
    products.filter(
      (product) =>
        product.active !==
        false
    ).length;

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>
            Product Master
          </h2>

          <p>
            {products.length} products ·{" "}
            {activeCount} active
          </p>
        </div>

        <Link
          className="primary-button link-button"
          to="/products/new"
        >
          <Plus size={18} />

          Add New Product
        </Link>
      </div>

      {location.state
        ?.message && (
        <div className="purchase-message success">
          {
            location.state
              .message
          }
        </div>
      )}

      <div className="panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search
              size={18}
            />

            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search product, barcode, SKU or category"
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  Product
                </th>

                <th>
                  Barcode
                </th>

                <th>
                  SKU
                </th>

                <th>
                  Category
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Selling Price
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(
                (
                  product
                ) => (
                  <tr
                    key={
                      product.id
                    }
                  >
                    <td>
                      <div className="table-product">
                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <span>
                          {
                            product.brand
                          }
                        </span>
                      </div>
                    </td>

                    <td className="mono">
                      {
                        product.barcode
                      }
                    </td>

                    <td>
                      {
                        product.sku
                      }
                    </td>

                    <td>
                      <span className="category-badge">
                        {
                          product.category
                        }
                      </span>
                    </td>

                    <td>
                      {getStock(
                        product.id
                      )}
                    </td>

                    <td>
                      {money.format(
                        product.price
                      )}
                    </td>

                    <td>
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
                    </td>

                    <td>
                      <Link
                        to={`/products/${product.id}/edit`}
                        className="edit-product-link"
                      >
                        <Pencil
                          size={15}
                        />

                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="demo-note">
        Products are currently stored in
        browser LocalStorage. Supabase will
        replace this storage layer in later
        chapters.
      </div>
    </div>
  );
}
