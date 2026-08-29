import { useMemo, useState } from "react";
import {
  CalendarDays,
  IndianRupee,
  PackagePlus,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";

import { useShop } from "../context/ShopContext";

const money =
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export default function Purchases() {
  const {
    products,
    purchases,
    getStock,
    receiveStock,
  } = useShop();

  const [supplierName, setSupplierName] =
    useState("");

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [invoiceDate, setInvoiceDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [notes, setNotes] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [items, setItems] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [
    messageType,
    setMessageType,
  ] = useState("info");

  const searchResults =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return [];
      }

      return products
        .filter(
          (product) =>
            product.name
              .toLowerCase()
              .includes(value) ||
            product.brand
              .toLowerCase()
              .includes(value) ||
            product.sku
              .toLowerCase()
              .includes(value) ||
            product.barcode.includes(value)
        )
        .slice(0, 8);
    }, [search, products]);

  function calculateQuantity(item) {
    const cases =
      Number(item.caseCount) || 0;

    const unitsPerCase =
      Number(item.unitsPerCase) || 0;

    const loose =
      Number(item.looseBottles) || 0;

    return (
      cases * unitsPerCase +
      loose
    );
  }

  function addProduct(product) {
    const alreadyAdded =
      items.some(
        (item) =>
          item.productId === product.id
      );

    if (alreadyAdded) {
      setMessage(
        `${product.name} is already added.`
      );

      setMessageType("error");
      return;
    }

    setItems(
      (currentItems) => [
        ...currentItems,
        {
          productId: product.id,
          productName:
            product.name,
          barcode:
            product.barcode,
          currentStock:
            getStock(product.id),

          caseCount: 1,

          unitsPerCase:
            product.unitsPerCase || 1,

          looseBottles: 0,

          purchasePrice:
            product.purchasePrice,
        },
      ]
    );

    setSearch("");

    setMessage(
      `${product.name} added.`
    );

    setMessageType("success");
  }

  function updateItem(
    productId,
    field,
    value
  ) {
    setItems(
      (currentItems) =>
        currentItems.map(
          (item) =>
            item.productId ===
            productId
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        )
    );
  }

  function removeItem(productId) {
    setItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.productId !==
            productId
        )
    );
  }

  const totalUnits =
    items.reduce(
      (total, item) =>
        total +
        calculateQuantity(item),
      0
    );

  const purchaseTotal =
    items.reduce(
      (total, item) => {
        const quantity =
          calculateQuantity(item);

        const price =
          Number(
            item.purchasePrice
          ) || 0;

        return (
          total +
          quantity * price
        );
      },
      0
    );

  function clearForm() {
    setSupplierName("");
    setInvoiceNumber("");

    setInvoiceDate(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

    setNotes("");
    setSearch("");
    setItems([]);
  }

  function handleReceiveStock() {
    const formattedItems =
      items.map((item) => ({
        productId:
          item.productId,

        caseCount:
          Number(item.caseCount) ||
          0,

        unitsPerCase:
          Number(
            item.unitsPerCase
          ) || 1,

        looseBottles:
          Number(
            item.looseBottles
          ) || 0,

        quantity:
          calculateQuantity(item),

        purchasePrice:
          Number(
            item.purchasePrice
          ),
      }));

    const result =
      receiveStock({
        supplierName,
        invoiceNumber,
        invoiceDate,
        items:
          formattedItems,
        notes,
      });

    if (!result.ok) {
      setMessage(
        result.message
      );

      setMessageType(
        "error"
      );

      return;
    }

    setMessage(
      `${result.purchase.purchaseNumber} received successfully. ` +
      `${result.purchase.totalUnits} bottle(s) added to inventory.`
    );

    setMessageType(
      "success"
    );

    clearForm();
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>
            Receive Stock
          </h2>

          <p>
            Supplier purchases,
            cases and loose bottles
          </p>
        </div>

        <div className="receive-heading-icon">
          <Truck size={20} />
          New Purchase
        </div>
      </div>

      {message && (
        <div
          className={`purchase-message ${messageType}`}
        >
          {message}
        </div>
      )}

      <div className="purchase-layout">
        <div className="purchase-main">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>
                  Supplier Information
                </h3>

                <p>
                  Enter supplier invoice
                  details
                </p>
              </div>
            </div>

            <div className="purchase-form-grid">
              <label>
                Supplier Name

                <input
                  value={
                    supplierName
                  }
                  onChange={(
                    event
                  ) =>
                    setSupplierName(
                      event.target
                        .value
                    )
                  }
                  placeholder="ABC Distributors"
                />
              </label>

              <label>
                Supplier Invoice

                <input
                  value={
                    invoiceNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setInvoiceNumber(
                      event.target
                        .value
                    )
                  }
                  placeholder="ABC-45822"
                />
              </label>

              <label>
                Invoice Date

                <div className="input-with-icon">
                  <CalendarDays
                    size={17}
                  />

                  <input
                    type="date"
                    value={
                      invoiceDate
                    }
                    onChange={(
                      event
                    ) =>
                      setInvoiceDate(
                        event.target
                          .value
                      )
                    }
                  />
                </div>
              </label>

              <label>
                Notes

                <input
                  value={notes}
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional notes"
                />
              </label>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>
                  Add Products
                </h3>

                <p>
                  Search by product,
                  barcode or SKU
                </p>
              </div>
            </div>

            <div className="purchase-search">
              <Search size={18} />

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search product..."
              />
            </div>

            {searchResults.length >
              0 && (
              <div className="purchase-search-results">
                {searchResults.map(
                  (product) => (
                    <button
                      key={
                        product.id
                      }
                      type="button"
                      className="purchase-search-result"
                      onClick={() =>
                        addProduct(
                          product
                        )
                      }
                    >
                      <div>
                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <span>
                          {
                            product.barcode
                          }{" "}
                          ·{" "}
                          {
                            product.sku
                          }
                        </span>
                      </div>

                      <div className="purchase-search-right">
                        <strong>
                          {money.format(
                            product.purchasePrice
                          )}
                        </strong>

                        <span>
                          Stock:{" "}
                          {getStock(
                            product.id
                          )}
                        </span>
                      </div>

                      <Plus
                        size={18}
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>
                  Purchase Items
                </h3>

                <p>
                  {items.length}{" "}
                  product(s)
                </p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="purchase-empty">
                <PackagePlus
                  size={42}
                />

                <strong>
                  No products added
                </strong>

                <span>
                  Search and add an
                  existing product.
                </span>
              </div>
            ) : (
              <div className="purchase-items case-purchase-items">
                {items.map(
                  (item) => {
                    const quantity =
                      calculateQuantity(
                        item
                      );

                    return (
                      <div
                        key={
                          item.productId
                        }
                        className="case-purchase-row"
                      >
                        <div className="case-product-header">
                          <div className="purchase-product-info">
                            <strong>
                              {
                                item.productName
                              }
                            </strong>

                            <span>
                              {
                                item.barcode
                              }
                            </span>

                            <small>
                              Current Stock:{" "}
                              {getStock(
                                item.productId
                              )}
                            </small>
                          </div>

                          <button
                            type="button"
                            className="icon-button danger"
                            onClick={() =>
                              removeItem(
                                item.productId
                              )
                            }
                          >
                            <Trash2
                              size={18}
                            />
                          </button>
                        </div>

                        <div className="case-entry-grid">
                          <label>
                            Cases

                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                item.caseCount
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  item.productId,
                                  "caseCount",
                                  event
                                    .target
                                    .value
                                )
                              }
                            />
                          </label>

                          <label>
                            Bottles / Case

                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={
                                item.unitsPerCase
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  item.productId,
                                  "unitsPerCase",
                                  event
                                    .target
                                    .value
                                )
                              }
                            />
                          </label>

                          <label>
                            Loose Bottles

                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                item.looseBottles
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  item.productId,
                                  "looseBottles",
                                  event
                                    .target
                                    .value
                                )
                              }
                            />
                          </label>

                          <label>
                            Purchase Price
                            / Bottle

                            <div className="price-input">
                              <IndianRupee
                                size={
                                  15
                                }
                              />

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  item.purchasePrice
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateItem(
                                    item.productId,
                                    "purchasePrice",
                                    event
                                      .target
                                      .value
                                  )
                                }
                              />
                            </div>
                          </label>
                        </div>

                        <div className="case-calculation">
                          <div>
                            <span>
                              Calculation
                            </span>

                            <strong>
                              {Number(
                                item.caseCount
                              ) ||
                                0}{" "}
                              ×{" "}
                              {Number(
                                item.unitsPerCase
                              ) ||
                                0}{" "}
                              +{" "}
                              {Number(
                                item.looseBottles
                              ) ||
                                0}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Total
                              Received
                            </span>

                            <strong>
                              {quantity}{" "}
                              bottles
                            </strong>
                          </div>

                          <div>
                            <span>
                              Line Total
                            </span>

                            <strong>
                              {money.format(
                                quantity *
                                  (Number(
                                    item.purchasePrice
                                  ) ||
                                    0)
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="purchase-summary">
          <div className="purchase-summary-title">
            <h3>
              Purchase Summary
            </h3>

            <span>
              {items.length} product(s)
            </span>
          </div>

          <div className="purchase-summary-lines">
            <div>
              <span>
                Total Products
              </span>

              <strong>
                {items.length}
              </strong>
            </div>

            <div>
              <span>
                Total Bottles
              </span>

              <strong>
                {totalUnits}
              </strong>
            </div>
          </div>

          <div className="purchase-grand-total">
            <span>
              Total Purchase
            </span>

            <strong>
              {money.format(
                purchaseTotal
              )}
            </strong>
          </div>

          <button
            className="receive-stock-button"
            onClick={
              handleReceiveStock
            }
            disabled={
              items.length === 0 ||
              totalUnits === 0
            }
          >
            <PackagePlus
              size={19}
            />

            Receive Stock
          </button>

          <div className="purchase-help">
            <strong>
              Inventory Rule
            </strong>

            <span>
              Cases are converted
              into individual
              sellable bottles
              before inventory is
              updated.
            </span>
          </div>
        </aside>
      </div>

      <section className="panel purchase-history-panel">
        <div className="panel-header">
          <div>
            <h3>
              Purchase History
            </h3>

            <p>
              Previously received
              supplier purchases
            </p>
          </div>
        </div>

        {purchases.length === 0 ? (
          <div className="empty-state">
            No purchases recorded.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    Purchase
                  </th>
                  <th>
                    Supplier
                  </th>
                  <th>
                    Supplier Invoice
                  </th>
                  <th>
                    Invoice Date
                  </th>
                  <th>
                    Products
                  </th>
                  <th>
                    Bottles
                  </th>
                  <th>
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {purchases.map(
                  (purchase) => (
                    <tr
                      key={
                        purchase.id
                      }
                    >
                      <td>
                        <strong>
                          {
                            purchase.purchaseNumber
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          purchase.supplierName
                        }
                      </td>

                      <td>
                        {
                          purchase.invoiceNumber
                        }
                      </td>

                      <td>
                        {
                          purchase.invoiceDate
                        }
                      </td>

                      <td>
                        {
                          purchase.items
                            .length
                        }
                      </td>

                      <td>
                        {purchase.totalUnits ??
                          purchase.items.reduce(
                            (
                              total,
                              item
                            ) =>
                              total +
                              item.quantity,
                            0
                          )}
                      </td>

                      <td>
                        <strong>
                          {money.format(
                            purchase.total
                          )}
                        </strong>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
