import {
  Save,
} from "lucide-react";

const categories = [
  "Whisky",
  "Beer",
  "Rum",
  "Vodka",
  "Brandy",
  "Wine",
  "Gin",
  "Tequila",
];

const defaults = {
  barcode: "",
  sku: "",
  name: "",
  brand: "",
  category: "Whisky",

  sizeMl: 750,

  alcoholPercentage: "",

  purchasePrice: 0,
  mrp: 0,
  price: 0,

  minimumStock: 5,
  unitsPerCase: 12,

  openingStock: 0,
};

import {
  useState,
} from "react";

export default function ProductForm({
  initialValues = {},
  showOpeningStock = false,
  submitLabel = "Save Product",
  onSubmit,
}) {
  const [
    form,
    setForm,
  ] = useState({
    ...defaults,
    ...initialValues,
  });

  function update(
    field,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function handleSubmit(
    event
  ) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form
      className="product-form"
      onSubmit={
        handleSubmit
      }
    >
      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>
              Product Identification
            </h3>

            <p>
              Barcode, SKU and product
              description
            </p>
          </div>
        </div>

        <div className="product-form-grid">
          <label>
            Barcode *

            <input
              value={
                form.barcode
              }
              onChange={(
                event
              ) =>
                update(
                  "barcode",
                  event.target
                    .value
                )
              }
              placeholder="8900000099999"
            />
          </label>

          <label>
            SKU *

            <input
              value={
                form.sku
              }
              onChange={(
                event
              ) =>
                update(
                  "sku",
                  event.target
                    .value
                )
              }
              placeholder="WH-NEW-750"
            />
          </label>

          <label className="product-form-wide">
            Product Name *

            <input
              value={
                form.name
              }
              onChange={(
                event
              ) =>
                update(
                  "name",
                  event.target
                    .value
                )
              }
              placeholder="Product Name 750ml"
            />
          </label>

          <label>
            Brand *

            <input
              value={
                form.brand
              }
              onChange={(
                event
              ) =>
                update(
                  "brand",
                  event.target
                    .value
                )
              }
              placeholder="Brand"
            />
          </label>

          <label>
            Category *

            <select
              value={
                form.category
              }
              onChange={(
                event
              ) =>
                update(
                  "category",
                  event.target
                    .value
                )
              }
            >
              {categories.map(
                (category) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Bottle Size (ml) *

            <input
              type="number"
              min="1"
              step="1"
              value={
                form.sizeMl
              }
              onChange={(
                event
              ) =>
                update(
                  "sizeMl",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Alcohol %

            <input
              type="number"
              min="0"
              step="0.1"
              value={
                form.alcoholPercentage
              }
              onChange={(
                event
              ) =>
                update(
                  "alcoholPercentage",
                  event.target
                    .value
                )
              }
              placeholder="42.8"
            />
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>
              Pricing & Inventory
            </h3>

            <p>
              Pricing, reorder level and
              case configuration
            </p>
          </div>
        </div>

        <div className="product-form-grid">
          <label>
            Purchase Price *

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                form.purchasePrice
              }
              onChange={(
                event
              ) =>
                update(
                  "purchasePrice",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            MRP *

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                form.mrp
              }
              onChange={(
                event
              ) =>
                update(
                  "mrp",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Selling Price *

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                form.price
              }
              onChange={(
                event
              ) =>
                update(
                  "price",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Minimum Stock *

            <input
              type="number"
              min="0"
              step="1"
              value={
                form.minimumStock
              }
              onChange={(
                event
              ) =>
                update(
                  "minimumStock",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Bottles Per Case *

            <input
              type="number"
              min="1"
              step="1"
              value={
                form.unitsPerCase
              }
              onChange={(
                event
              ) =>
                update(
                  "unitsPerCase",
                  event.target
                    .value
                )
              }
            />
          </label>

          {showOpeningStock && (
            <label>
              Opening Stock *

              <input
                type="number"
                min="0"
                step="1"
                value={
                  form.openingStock
                }
                onChange={(
                  event
                ) =>
                  update(
                    "openingStock",
                    event.target
                      .value
                  )
                }
              />
            </label>
          )}
        </div>

        {!showOpeningStock && (
          <div className="inventory-edit-warning">
            Current inventory is not changed
            when product details are edited.
            Use Receive Stock or Stock
            Adjustment for inventory changes.
          </div>
        )}
      </section>

      <div className="product-form-actions">
        <button
          type="submit"
          className="primary-button product-save-button"
        >
          <Save size={18} />

          {submitLabel}
        </button>
      </div>
    </form>
  );
}
