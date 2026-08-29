#!/usr/bin/env bash
set -euo pipefail

cd /e/WineShopPOS

echo "============================================================"
echo "WineShopPOS - Chapters 9 to 12"
echo "Payments + Sales Details + Dashboard + Reports + Backup"
echo "============================================================"

mkdir -p src/pages
mkdir -p src/components
mkdir -p docs/chapters
mkdir -p docs/testing

# ============================================================
# FINAL LOCAL-MVP SHOP CONTEXT
# ============================================================

cat > src/context/ShopContext.jsx <<'EOF'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { products as seedProducts } from "../data/products";

const ShopContext = createContext(null);

const PRODUCTS_KEY = "wineshop_products_v1";
const INVENTORY_KEY = "wineshop_inventory_v1";
const SALES_KEY = "wineshop_sales_v1";
const PURCHASES_KEY = "wineshop_purchases_v1";

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeProduct(product) {
  const sizeMl =
    product.sizeMl ??
    Number.parseInt(String(product.size ?? ""), 10) ??
    0;

  return {
    ...product,
    active: product.active !== false,
    mrp: Number(product.mrp ?? product.price ?? 0),
    price: Number(product.price ?? 0),
    purchasePrice: Number(product.purchasePrice ?? 0),
    minimumStock: Number(product.minimumStock ?? 0),
    unitsPerCase: Number(product.unitsPerCase ?? 1),
    openingStock: Number(product.openingStock ?? 0),
    sizeMl: Number.isFinite(sizeMl) ? sizeMl : 0,
    size: product.size ?? `${sizeMl || 0} ml`,
  };
}

function createInitialProducts() {
  const savedProducts = loadJSON(PRODUCTS_KEY, null);

  if (Array.isArray(savedProducts) && savedProducts.length > 0) {
    return savedProducts.map(normalizeProduct);
  }

  return seedProducts.map(normalizeProduct);
}

function createInitialInventory(productList) {
  const savedInventory = loadJSON(INVENTORY_KEY, {});

  return productList.reduce((result, product) => {
    result[product.id] =
      typeof savedInventory[product.id] === "number"
        ? savedInventory[product.id]
        : Number(product.openingStock) || 0;

    return result;
  }, {});
}

function createInitialSales() {
  const sales = loadJSON(SALES_KEY, []);
  return Array.isArray(sales) ? sales : [];
}

function createInitialPurchases() {
  const purchases = loadJSON(PURCHASES_KEY, []);
  return Array.isArray(purchases) ? purchases : [];
}

export function ShopProvider({ children }) {
  const initialProducts = useMemo(() => createInitialProducts(), []);

  const [products, setProducts] = useState(initialProducts);
  const [inventory, setInventory] = useState(() =>
    createInitialInventory(initialProducts)
  );
  const [sales, setSales] = useState(createInitialSales);
  const [purchases, setPurchases] = useState(createInitialPurchases);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
  }, [purchases]);

  function getStock(productId) {
    return inventory[productId] ?? 0;
  }

  function validateProduct(data, editingId = null, includeOpeningStock = false) {
    const barcode = String(data.barcode ?? "").trim();
    const sku = String(data.sku ?? "").trim().toUpperCase();
    const name = String(data.name ?? "").trim();
    const brand = String(data.brand ?? "").trim();
    const category = String(data.category ?? "").trim();

    const sizeMl = Number(data.sizeMl);
    const alcoholPercentage =
      data.alcoholPercentage === "" ||
      data.alcoholPercentage === null ||
      data.alcoholPercentage === undefined
        ? null
        : Number(data.alcoholPercentage);

    const purchasePrice = Number(data.purchasePrice);
    const mrp = Number(data.mrp);
    const price = Number(data.price);
    const minimumStock = Number(data.minimumStock);
    const unitsPerCase = Number(data.unitsPerCase);
    const openingStock = includeOpeningStock ? Number(data.openingStock) : 0;

    if (!barcode) return { ok: false, message: "Barcode is required." };
    if (!sku) return { ok: false, message: "SKU is required." };
    if (!name) return { ok: false, message: "Product name is required." };
    if (!brand) return { ok: false, message: "Brand is required." };
    if (!category) return { ok: false, message: "Category is required." };

    if (!Number.isInteger(sizeMl) || sizeMl <= 0) {
      return { ok: false, message: "Bottle size must be greater than 0." };
    }

    if (Number.isNaN(purchasePrice) || purchasePrice < 0) {
      return { ok: false, message: "Purchase price is invalid." };
    }

    if (Number.isNaN(mrp) || mrp < 0) {
      return { ok: false, message: "MRP is invalid." };
    }

    if (Number.isNaN(price) || price < 0) {
      return { ok: false, message: "Selling price is invalid." };
    }

    if (!Number.isInteger(minimumStock) || minimumStock < 0) {
      return { ok: false, message: "Minimum stock is invalid." };
    }

    if (!Number.isInteger(unitsPerCase) || unitsPerCase <= 0) {
      return {
        ok: false,
        message: "Bottles per case must be greater than 0.",
      };
    }

    if (
      includeOpeningStock &&
      (!Number.isInteger(openingStock) || openingStock < 0)
    ) {
      return { ok: false, message: "Opening stock is invalid." };
    }

    if (
      alcoholPercentage !== null &&
      (Number.isNaN(alcoholPercentage) || alcoholPercentage < 0)
    ) {
      return { ok: false, message: "Alcohol percentage is invalid." };
    }

    const duplicateBarcode = products.some(
      (product) =>
        product.id !== editingId &&
        String(product.barcode).trim() === barcode
    );

    if (duplicateBarcode) {
      return {
        ok: false,
        message: "A product with this barcode already exists.",
      };
    }

    const duplicateSku = products.some(
      (product) =>
        product.id !== editingId &&
        String(product.sku).trim().toUpperCase() === sku
    );

    if (duplicateSku) {
      return {
        ok: false,
        message: "A product with this SKU already exists.",
      };
    }

    return {
      ok: true,
      value: {
        barcode,
        sku,
        name,
        brand,
        category,
        sizeMl,
        size: `${sizeMl} ml`,
        alcoholPercentage,
        purchasePrice,
        mrp,
        price,
        minimumStock,
        unitsPerCase,
        openingStock,
      },
    };
  }

  function addProduct(productData) {
    const validation = validateProduct(productData, null, true);

    if (!validation.ok) return validation;

    const now = new Date().toISOString();

    const product = {
      id: crypto.randomUUID(),
      ...validation.value,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    setProducts((current) => [product, ...current]);
    setInventory((current) => ({
      ...current,
      [product.id]: validation.value.openingStock,
    }));

    return {
      ok: true,
      product,
      message: `${product.name} created successfully.`,
    };
  }

  function updateProduct(productId, productData) {
    const existing = products.find((product) => product.id === productId);

    if (!existing) {
      return { ok: false, message: "Product not found." };
    }

    const validation = validateProduct(productData, productId, false);

    if (!validation.ok) return validation;

    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              ...validation.value,
              openingStock: product.openingStock,
              updatedAt: new Date().toISOString(),
            }
          : product
      )
    );

    return {
      ok: true,
      message: `${validation.value.name} updated successfully.`,
    };
  }

  function setProductStatus(productId, active) {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return { ok: false, message: "Product not found." };
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === productId
          ? {
              ...item,
              active,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    return {
      ok: true,
      message: `${product.name} ${active ? "activated" : "deactivated"}.`,
    };
  }

  function deactivateProduct(productId) {
    return setProductStatus(productId, false);
  }

  function activateProduct(productId) {
    return setProductStatus(productId, true);
  }

  function completeSale(
    cart,
    paymentMethod,
    {
      discount = 0,
      paymentReference = "",
    } = {}
  ) {
    if (!cart.length) {
      return { ok: false, message: "Cart is empty." };
    }

    const allowedPaymentMethods = ["CASH", "UPI", "CARD"];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return { ok: false, message: "Invalid payment method." };
    }

    for (const item of cart) {
      const currentProduct = products.find(
        (product) => product.id === item.product.id
      );

      if (!currentProduct || currentProduct.active === false) {
        return {
          ok: false,
          message: `${item.product.name} is inactive and cannot be sold.`,
        };
      }

      const available = inventory[item.product.id] ?? 0;

      if (item.quantity > available) {
        return {
          ok: false,
          message: `Only ${available} unit(s) of ${item.product.name} are available.`,
        };
      }
    }

    const subtotal = cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    const normalizedDiscount = Number(discount);

    if (
      Number.isNaN(normalizedDiscount) ||
      normalizedDiscount < 0 ||
      normalizedDiscount > subtotal
    ) {
      return {
        ok: false,
        message: "Discount must be between ₹0 and the subtotal.",
      };
    }

    const updatedInventory = { ...inventory };

    cart.forEach((item) => {
      updatedInventory[item.product.id] -= item.quantity;
    });

    const grandTotal = subtotal - normalizedDiscount;

    const invoiceNumber =
      `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-` +
      `${String(sales.length + 1).padStart(4, "0")}`;

    const sale = {
      id: crypto.randomUUID(),
      invoiceNumber,
      createdAt: new Date().toISOString(),
      paymentMethod,
      paymentReference: String(paymentReference ?? "").trim(),
      subtotal,
      discount: normalizedDiscount,
      grandTotal,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        barcode: item.product.barcode,
        quantity: item.quantity,
        unitPrice: item.product.price,
        purchasePrice: Number(item.product.purchasePrice ?? 0),
        lineTotal: item.product.price * item.quantity,
      })),
    };

    setInventory(updatedInventory);
    setSales((current) => [sale, ...current]);

    return { ok: true, sale };
  }

  function receiveStock({
    supplierName,
    invoiceNumber,
    invoiceDate,
    items,
    notes = "",
  }) {
    if (!supplierName?.trim()) {
      return { ok: false, message: "Supplier name is required." };
    }

    if (!invoiceNumber?.trim()) {
      return {
        ok: false,
        message: "Supplier invoice number is required.",
      };
    }

    if (!items?.length) {
      return { ok: false, message: "Add at least one product." };
    }

    const duplicateInvoice = purchases.some(
      (purchase) =>
        purchase.invoiceNumber.trim().toLowerCase() ===
        invoiceNumber.trim().toLowerCase()
    );

    if (duplicateInvoice) {
      return {
        ok: false,
        message: "This supplier invoice already exists.",
      };
    }

    const updatedInventory = { ...inventory };
    const purchaseItems = [];

    for (const item of items) {
      const product = products.find(
        (productItem) => productItem.id === item.productId
      );

      if (!product || product.active === false) {
        return {
          ok: false,
          message: "Invalid or inactive product selected.",
        };
      }

      const quantity = Number(item.quantity);
      const purchasePrice = Number(item.purchasePrice);
      const caseCount = Number(item.caseCount) || 0;
      const unitsPerCase = Number(item.unitsPerCase) || 1;
      const looseBottles = Number(item.looseBottles) || 0;

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return {
          ok: false,
          message: `Invalid quantity for ${product.name}.`,
        };
      }

      if (Number.isNaN(purchasePrice) || purchasePrice < 0) {
        return {
          ok: false,
          message: `Invalid purchase price for ${product.name}.`,
        };
      }

      const stockBefore = updatedInventory[product.id] ?? 0;
      const stockAfter = stockBefore + quantity;

      updatedInventory[product.id] = stockAfter;

      purchaseItems.push({
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        purchaseUnit: caseCount > 0 ? "CASE" : "BOTTLE",
        caseCount,
        unitsPerCase,
        looseBottles,
        quantity,
        purchasePrice,
        lineTotal: quantity * purchasePrice,
        stockBefore,
        stockAfter,
      });
    }

    const total = purchaseItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );

    const totalUnits = purchaseItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const purchaseNumber =
      `PUR-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-` +
      `${String(purchases.length + 1).padStart(4, "0")}`;

    const purchase = {
      id: crypto.randomUUID(),
      purchaseNumber,
      supplierName: supplierName.trim(),
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate:
        invoiceDate || new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      notes,
      total,
      totalUnits,
      items: purchaseItems,
    };

    setInventory(updatedInventory);
    setPurchases((current) => [purchase, ...current]);

    return { ok: true, purchase };
  }

  function createBackup() {
    return {
      meta: {
        app: "WineShopPOS",
        formatVersion: 1,
        exportedAt: new Date().toISOString(),
      },
      data: {
        products,
        inventory,
        sales,
        purchases,
      },
    };
  }

  function importBackup(backup) {
    if (
      !backup ||
      backup.meta?.app !== "WineShopPOS" ||
      !backup.data ||
      !Array.isArray(backup.data.products) ||
      typeof backup.data.inventory !== "object" ||
      backup.data.inventory === null ||
      !Array.isArray(backup.data.sales) ||
      !Array.isArray(backup.data.purchases)
    ) {
      return {
        ok: false,
        message: "This is not a valid WineShopPOS backup file.",
      };
    }

    const importedProducts = backup.data.products.map(normalizeProduct);

    const importedInventory = importedProducts.reduce(
      (result, product) => {
        const quantity = Number(backup.data.inventory[product.id]);

        result[product.id] =
          Number.isFinite(quantity) && quantity >= 0
            ? Math.trunc(quantity)
            : 0;

        return result;
      },
      {}
    );

    setProducts(importedProducts);
    setInventory(importedInventory);
    setSales(backup.data.sales);
    setPurchases(backup.data.purchases);

    return {
      ok: true,
      message:
        `Backup restored: ${importedProducts.length} products, ` +
        `${backup.data.sales.length} sales and ` +
        `${backup.data.purchases.length} purchases.`,
    };
  }

  function resetDemo() {
    const resetProducts = seedProducts.map(normalizeProduct);

    const resetInventory = resetProducts.reduce((result, product) => {
      result[product.id] = Number(product.openingStock) || 0;
      return result;
    }, {});

    setProducts(resetProducts);
    setInventory(resetInventory);
    setSales([]);
    setPurchases([]);
  }

  return (
    <ShopContext.Provider
      value={{
        products,
        inventory,
        sales,
        purchases,
        getStock,
        addProduct,
        updateProduct,
        deactivateProduct,
        activateProduct,
        completeSale,
        receiveStock,
        createBackup,
        importBackup,
        resetDemo,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}
EOF

# ============================================================
# CHAPTER 9 - ENHANCED POS
# ============================================================

cat > src/pages/POS.jsx <<'EOF'
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  ScanBarcode,
  Search,
  ShoppingCart,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function POS() {
  const { products, getStock, completeSale } = useShop();
  const navigate = useNavigate();

  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState(
    "Ready to scan. Try barcode 8900000010016"
  );
  const [messageType, setMessageType] = useState("info");

  const barcodeRef = useRef(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const searchResults = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return [];

    return products
      .filter(
        (product) =>
          product.active !== false &&
          (
            product.name.toLowerCase().includes(value) ||
            product.brand.toLowerCase().includes(value) ||
            product.sku.toLowerCase().includes(value) ||
            product.barcode.includes(value)
          )
      )
      .slice(0, 8);
  }, [search, products]);

  function currentCartQuantity(productId) {
    return (
      cart.find((item) => item.product.id === productId)?.quantity || 0
    );
  }

  function addProduct(product) {
    if (product.active === false) {
      setMessage(`${product.name} is inactive.`);
      setMessageType("error");
      return;
    }

    const available = getStock(product.id);
    const alreadyInCart = currentCartQuantity(product.id);

    if (available <= 0) {
      setMessage(`${product.name} is OUT OF STOCK.`);
      setMessageType("error");
      return;
    }

    if (alreadyInCart + 1 > available) {
      setMessage(`Only ${available} unit(s) of ${product.name} available.`);
      setMessageType("error");
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });

    setMessage(`${product.name} added to cart.`);
    setMessageType("success");
  }

  function handleBarcodeSubmit(event) {
    event.preventDefault();

    const scannedBarcode = barcode.trim();

    if (!scannedBarcode) return;

    const product = products.find(
      (item) =>
        item.active !== false &&
        item.barcode === scannedBarcode
    );

    if (!product) {
      setMessage(`PRODUCT NOT FOUND: ${scannedBarcode}`);
      setMessageType("error");
    } else {
      addProduct(product);
    }

    setBarcode("");

    requestAnimationFrame(() => barcodeRef.current?.focus());
  }

  function changeQuantity(productId, delta) {
    const item = cart.find(
      (cartItem) => cartItem.product.id === productId
    );

    if (!item) return;

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const available = getStock(productId);

    if (newQuantity > available) {
      setMessage(`Only ${available} unit(s) available.`);
      setMessageType("error");
      return;
    }

    setCart((current) =>
      current.map((cartItem) =>
        cartItem.product.id === productId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  }

  function removeItem(productId) {
    setCart((current) =>
      current.filter((item) => item.product.id !== productId)
    );
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const normalizedDiscount = Math.max(0, Number(discount) || 0);
  const grandTotal = Math.max(0, subtotal - normalizedDiscount);

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function handleCompleteSale() {
    const result = completeSale(cart, paymentMethod, {
      discount: normalizedDiscount,
      paymentReference,
    });

    if (!result.ok) {
      setMessage(result.message);
      setMessageType("error");
      return;
    }

    const saleId = result.sale.id;

    setCart([]);
    setSearch("");
    setDiscount(0);
    setPaymentReference("");
    setMessage(
      `${result.sale.invoiceNumber} completed successfully for ${money.format(
        result.sale.grandTotal
      )}.`
    );
    setMessageType("success");

    navigate(`/sales/${saleId}`);

    requestAnimationFrame(() => barcodeRef.current?.focus());
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>POS Billing</h2>
          <p>Scan barcode or search a product manually</p>
        </div>

        <div className="cart-count">
          <ShoppingCart size={18} />
          {itemCount} item(s)
        </div>
      </div>

      <div className="pos-layout">
        <section className="pos-left">
          <div className="panel barcode-panel">
            <form onSubmit={handleBarcodeSubmit}>
              <label className="input-label">
                <ScanBarcode size={18} />
                Scan Barcode
              </label>

              <div className="barcode-input-row">
                <input
                  ref={barcodeRef}
                  className="barcode-input"
                  value={barcode}
                  onChange={(event) => setBarcode(event.target.value)}
                  placeholder="Scan barcode and press Enter"
                  autoComplete="off"
                />

                <button className="primary-button" type="submit">
                  Add
                </button>
              </div>
            </form>

            <div className={`pos-message ${messageType}`}>
              {message}
            </div>
          </div>

          <div className="panel">
            <label className="input-label">
              <Search size={18} />
              Manual Product Search
            </label>

            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product, brand, SKU or barcode"
            />

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((product) => (
                  <button
                    type="button"
                    className="search-result"
                    key={product.id}
                    onClick={() => addProduct(product)}
                  >
                    <div>
                      <strong>{product.name}</strong>
                      <span>
                        {product.barcode} · {product.sku}
                      </span>
                    </div>

                    <div className="search-result-right">
                      <strong>{money.format(product.price)}</strong>
                      <span>Stock: {getStock(product.id)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Current Cart</h3>
                <p>Products added to this bill</p>
              </div>

              {cart.length > 0 && (
                <button
                  className="text-button danger-text"
                  onClick={() => setCart([])}
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={42} />
                <strong>Cart is empty</strong>
                <span>Scan a barcode to begin billing.</span>
              </div>
            ) : (
              <div className="cart-table">
                {cart.map((item) => (
                  <div className="cart-row" key={item.product.id}>
                    <div className="cart-product">
                      <strong>{item.product.name}</strong>
                      <span>
                        {item.product.barcode} · Stock{" "}
                        {getStock(item.product.id)}
                      </span>
                    </div>

                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          changeQuantity(item.product.id, -1)
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        onClick={() =>
                          changeQuantity(item.product.id, 1)
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="cart-price">
                      <span>{money.format(item.product.price)} each</span>
                      <strong>
                        {money.format(
                          item.product.price * item.quantity
                        )}
                      </strong>
                    </div>

                    <button
                      className="icon-button danger"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="checkout-panel">
          <div>
            <h3>Bill Summary</h3>
            <p>{itemCount} item(s)</p>
          </div>

          <div className="bill-lines">
            <div>
              <span>Subtotal</span>
              <strong>{money.format(subtotal)}</strong>
            </div>

            <div className="discount-entry">
              <span>Discount ₹</span>
              <input
                type="number"
                min="0"
                max={subtotal}
                step="1"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
              />
            </div>
          </div>

          <div className="grand-total">
            <span>Grand Total</span>
            <strong>{money.format(grandTotal)}</strong>
          </div>

          <div className="payment-title">Payment Method</div>

          <div className="payment-options">
            <button
              className={
                paymentMethod === "CASH"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("CASH")}
            >
              <Banknote size={21} />
              CASH
            </button>

            <button
              className={
                paymentMethod === "UPI"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("UPI")}
            >
              <Smartphone size={21} />
              UPI
            </button>

            <button
              className={
                paymentMethod === "CARD"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("CARD")}
            >
              <CreditCard size={21} />
              CARD
            </button>
          </div>

          {paymentMethod !== "CASH" && (
            <label className="payment-reference-label">
              {paymentMethod === "UPI"
                ? "UPI Reference (optional)"
                : "Card Reference (optional)"}

              <input
                value={paymentReference}
                onChange={(event) =>
                  setPaymentReference(event.target.value)
                }
                placeholder="Transaction / reference number"
              />
            </label>
          )}

          <button
            className="complete-sale"
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
          >
            Complete Sale
            <span>{money.format(grandTotal)}</span>
          </button>

          <div className="test-barcode-box">
            <strong>Test Scanner</strong>
            <span>Try typing:</span>
            <code>8900000010016</code>
            <span>Then press Enter.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
EOF

# ============================================================
# CHAPTER 9 - SALES HISTORY
# ============================================================

cat > src/pages/Sales.jsx <<'EOF'
import { Eye, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Sales() {
  const { sales } = useShop();

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Sales History</h2>
          <p>{sales.length} completed transaction(s)</p>
        </div>
      </div>

      <div className="panel">
        {sales.length === 0 ? (
          <div className="large-empty-state">
            <ReceiptText size={48} />
            <h3>No sales yet</h3>
            <p>Complete a transaction from POS Billing.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <strong>{sale.invoiceNumber}</strong>
                    </td>

                    <td>
                      {new Date(sale.createdAt).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {sale.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}
                    </td>

                    <td>
                      <span className="category-badge">
                        {sale.paymentMethod}
                      </span>
                    </td>

                    <td>{money.format(Number(sale.discount ?? 0))}</td>

                    <td>
                      <strong>{money.format(sale.grandTotal)}</strong>
                    </td>

                    <td>
                      <Link
                        className="edit-product-link"
                        to={`/sales/${sale.id}`}
                      >
                        <Eye size={15} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
EOF

# ============================================================
# CHAPTER 9 - SALE / INVOICE DETAILS
# ============================================================

cat > src/pages/SaleDetails.jsx <<'EOF'
import { ArrowLeft, Printer, ReceiptText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function SaleDetails() {
  const { id } = useParams();
  const { sales } = useShop();

  const sale = sales.find((item) => item.id === id);

  if (!sale) {
    return (
      <div className="panel">
        <h3>Sale not found</h3>
        <Link to="/sales">Return to Sales</Link>
      </div>
    );
  }

  return (
    <div className="sale-detail-page">
      <div className="page-heading no-print">
        <div>
          <Link className="back-link" to="/sales">
            <ArrowLeft size={16} />
            Sales
          </Link>

          <h2>Invoice Details</h2>
          <p>{sale.invoiceNumber}</p>
        </div>

        <button
          className="secondary-button print-button"
          onClick={() => window.print()}
        >
          <Printer size={17} />
          Print Preview
        </button>
      </div>

      <section className="invoice-card">
        <div className="invoice-header">
          <div>
            <ReceiptText size={30} />
            <h2>WineShop POS</h2>
            <p>Development Receipt</p>
          </div>

          <div className="invoice-meta">
            <strong>{sale.invoiceNumber}</strong>
            <span>
              {new Date(sale.createdAt).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="invoice-info-grid">
          <div>
            <span>Payment Method</span>
            <strong>{sale.paymentMethod}</strong>
          </div>

          <div>
            <span>Payment Reference</span>
            <strong>{sale.paymentReference || "—"}</strong>
          </div>

          <div>
            <span>Total Items</span>
            <strong>
              {sale.items.reduce(
                (total, item) => total + item.quantity,
                0
              )}
            </strong>
          </div>
        </div>

        <div className="invoice-table-wrapper">
          <table className="data-table invoice-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {sale.items.map((item) => (
                <tr key={`${sale.id}-${item.productId}`}>
                  <td>
                    <strong>{item.productName}</strong>
                    <div className="invoice-barcode">{item.barcode}</div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{money.format(item.unitPrice)}</td>
                  <td>{money.format(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-totals">
          <div>
            <span>Subtotal</span>
            <strong>{money.format(sale.subtotal)}</strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>{money.format(Number(sale.discount ?? 0))}</strong>
          </div>

          <div className="invoice-grand-total">
            <span>Grand Total</span>
            <strong>{money.format(sale.grandTotal)}</strong>
          </div>
        </div>

        <div className="invoice-footer">
          Dummy development receipt. Tax/excise/receipt compliance will be
          configured in later production chapters.
        </div>
      </section>
    </div>
  );
}
EOF

# ============================================================
# CHAPTER 10 - ENHANCED DASHBOARD
# ============================================================

cat > src/pages/Dashboard.jsx <<'EOF'
import {
  Banknote,
  CreditCard,
  IndianRupee,
  PackageCheck,
  ReceiptText,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Dashboard() {
  const { products, sales, getStock } = useShop();

  const today = new Date().toDateString();

  const todaysSales = sales.filter(
    (sale) => new Date(sale.createdAt).toDateString() === today
  );

  const revenue = todaysSales.reduce(
    (total, sale) => total + Number(sale.grandTotal ?? 0),
    0
  );

  const averageBill = todaysSales.length
    ? revenue / todaysSales.length
    : 0;

  const lowStockProducts = products.filter(
    (product) =>
      product.active !== false &&
      getStock(product.id) <= Number(product.minimumStock ?? 0)
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total + getStock(product.id) * Number(product.purchasePrice ?? 0),
    0
  );

  const paymentSummary = todaysSales.reduce(
    (result, sale) => {
      const method = sale.paymentMethod || "OTHER";
      result[method] = (result[method] || 0) + Number(sale.grandTotal ?? 0);
      return result;
    },
    {}
  );

  const productSales = {};

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          productName: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }

      productSales[item.productId].quantity += Number(item.quantity ?? 0);
      productSales[item.productId].revenue += Number(item.lineTotal ?? 0);
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 7);

  const cards = [
    {
      label: "Today's Sales",
      value: money.format(revenue),
      icon: IndianRupee,
      note: "Revenue today",
    },
    {
      label: "Bills Today",
      value: todaysSales.length,
      icon: ReceiptText,
      note: `Avg ${money.format(averageBill)}`,
    },
    {
      label: "Low Stock",
      value: lowStockProducts.length,
      icon: TriangleAlert,
      note: "Needs attention",
    },
    {
      label: "Inventory Value",
      value: money.format(inventoryValue),
      icon: PackageCheck,
      note: "At purchase cost",
    },
  ];

  const payments = [
    {
      label: "Cash",
      value: paymentSummary.CASH || 0,
      icon: Banknote,
    },
    {
      label: "UPI",
      value: paymentSummary.UPI || 0,
      icon: Smartphone,
    },
    {
      label: "Card",
      value: paymentSummary.CARD || 0,
      icon: CreditCard,
    },
  ];

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Store overview and today's performance</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="stat-card" key={card.label}>
              <div className="stat-icon">
                <Icon size={21} />
              </div>

              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-note">{card.note}</div>
            </div>
          );
        })}
      </div>

      <div className="payment-kpi-grid">
        {payments.map((payment) => {
          const Icon = payment.icon;

          return (
            <div className="payment-kpi" key={payment.label}>
              <Icon size={19} />
              <div>
                <span>{payment.label} Today</span>
                <strong>{money.format(payment.value)}</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Sales</h3>
              <p>Latest completed bills</p>
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="empty-state">
              No sales yet. Open POS and complete your first bill.
            </div>
          ) : (
            <div className="simple-list">
              {sales.slice(0, 7).map((sale) => (
                <div className="simple-list-row" key={sale.id}>
                  <div>
                    <strong>{sale.invoiceNumber}</strong>
                    <span>
                      {new Date(sale.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="align-right">
                    <strong>{money.format(sale.grandTotal)}</strong>
                    <span>{sale.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Low Stock Products</h3>
              <p>Products at or below minimum level</p>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="empty-state">No low-stock products.</div>
          ) : (
            <div className="simple-list">
              {lowStockProducts.slice(0, 8).map((product) => (
                <div className="simple-list-row" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>

                  <div className="stock-low">
                    {getStock(product.id)} left
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="panel dashboard-top-products">
        <div className="panel-header">
          <div>
            <h3>Top Selling Products</h3>
            <p>Based on all local sales</p>
          </div>
        </div>

        {topProducts.length === 0 ? (
          <div className="empty-state">No product sales yet.</div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.productName}>
                    <td>
                      <strong>{product.productName}</strong>
                    </td>
                    <td>{product.quantity}</td>
                    <td>{money.format(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="demo-note">
        Development mode: product prices and barcodes are dummy test data.
      </div>
    </div>
  );
}
EOF

# ============================================================
# CHAPTER 11 - REPORTS
# ============================================================

cat > src/pages/Reports.jsx <<'EOF'
import { useMemo, useState } from "react";
import { BarChart3, Search } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function toDateValue(date) {
  return date.toISOString().slice(0, 10);
}

export default function Reports() {
  const { products, inventory, sales, purchases, getStock } = useShop();

  const today = new Date();

  const [fromDate, setFromDate] = useState(
    toDateValue(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    )
  );

  const [toDate, setToDate] = useState(toDateValue(today));
  const [productSearch, setProductSearch] = useState("");

  const filteredSales = useMemo(() => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    return sales.filter((sale) => {
      const date = new Date(sale.createdAt);
      return (!from || date >= from) && (!to || date <= to);
    });
  }, [sales, fromDate, toDate]);

  const filteredPurchases = useMemo(() => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    return purchases.filter((purchase) => {
      const date = new Date(
        purchase.createdAt ||
          `${purchase.invoiceDate}T00:00:00`
      );

      return (!from || date >= from) && (!to || date <= to);
    });
  }, [purchases, fromDate, toDate]);

  const salesRevenue = filteredSales.reduce(
    (total, sale) => total + Number(sale.grandTotal ?? 0),
    0
  );

  const discountTotal = filteredSales.reduce(
    (total, sale) => total + Number(sale.discount ?? 0),
    0
  );

  const purchaseTotal = filteredPurchases.reduce(
    (total, purchase) => total + Number(purchase.total ?? 0),
    0
  );

  const productReport = {};

  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      const key = item.productId || item.productName;

      if (!productReport[key]) {
        productReport[key] = {
          productName: item.productName,
          quantity: 0,
          revenue: 0,
          estimatedCost: 0,
        };
      }

      const quantity = Number(item.quantity ?? 0);
      const lineTotal = Number(item.lineTotal ?? 0);
      const product = products.find(
        (candidate) => candidate.id === item.productId
      );

      const purchasePrice =
        Number(item.purchasePrice ?? product?.purchasePrice ?? 0);

      productReport[key].quantity += quantity;
      productReport[key].revenue += lineTotal;
      productReport[key].estimatedCost += purchasePrice * quantity;
    });
  });

  const productRows = Object.values(productReport)
    .filter((row) =>
      row.productName
        .toLowerCase()
        .includes(productSearch.trim().toLowerCase())
    )
    .sort((a, b) => b.revenue - a.revenue);

  const categoryReport = {};

  productRows.forEach((row) => {
    const product = products.find(
      (item) => item.name === row.productName
    );

    const category = product?.category || "Unknown";

    if (!categoryReport[category]) {
      categoryReport[category] = {
        category,
        quantity: 0,
        revenue: 0,
      };
    }

    categoryReport[category].quantity += row.quantity;
    categoryReport[category].revenue += row.revenue;
  });

  const paymentReport = filteredSales.reduce(
    (result, sale) => {
      const method = sale.paymentMethod || "OTHER";

      if (!result[method]) {
        result[method] = {
          method,
          bills: 0,
          value: 0,
        };
      }

      result[method].bills += 1;
      result[method].value += Number(sale.grandTotal ?? 0);

      return result;
    },
    {}
  );

  const inventoryPurchaseValue = products.reduce(
    (total, product) =>
      total + getStock(product.id) * Number(product.purchasePrice ?? 0),
    0
  );

  const potentialSalesValue = products.reduce(
    (total, product) =>
      total + getStock(product.id) * Number(product.price ?? 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      product.active !== false &&
      getStock(product.id) <= Number(product.minimumStock ?? 0)
  );

  const estimatedGrossMargin = productRows.reduce(
    (total, row) => total + (row.revenue - row.estimatedCost),
    0
  ) - discountTotal;

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Reports</h2>
          <p>Local MVP sales, purchase and inventory reporting</p>
        </div>
      </div>

      <section className="panel report-filter-panel">
        <div className="report-filter-grid">
          <label>
            From
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <label>
            To
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>

          <div className="report-period-note">
            <BarChart3 size={18} />
            Reporting period applies to sales and purchases.
          </div>
        </div>
      </section>

      <div className="report-kpi-grid">
        <div className="report-kpi">
          <span>Sales</span>
          <strong>{money.format(salesRevenue)}</strong>
          <small>{filteredSales.length} bills</small>
        </div>

        <div className="report-kpi">
          <span>Purchases</span>
          <strong>{money.format(purchaseTotal)}</strong>
          <small>{filteredPurchases.length} receipts</small>
        </div>

        <div className="report-kpi">
          <span>Estimated Gross Margin</span>
          <strong>{money.format(estimatedGrossMargin)}</strong>
          <small>Development estimate</small>
        </div>

        <div className="report-kpi">
          <span>Inventory Purchase Value</span>
          <strong>{money.format(inventoryPurchaseValue)}</strong>
          <small>Current stock</small>
        </div>

        <div className="report-kpi">
          <span>Potential Sales Value</span>
          <strong>{money.format(potentialSalesValue)}</strong>
          <small>Current stock at selling price</small>
        </div>

        <div className="report-kpi">
          <span>Low Stock SKUs</span>
          <strong>{lowStockProducts.length}</strong>
          <small>At or below minimum</small>
        </div>
      </div>

      <section className="panel report-section">
        <div className="panel-header">
          <div>
            <h3>Product-wise Sales</h3>
            <p>Units, revenue and estimated margin</p>
          </div>
        </div>

        <div className="table-search report-search">
          <Search size={18} />
          <input
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
            placeholder="Filter product report..."
          />
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units</th>
                <th>Revenue</th>
                <th>Estimated Cost</th>
                <th>Estimated Margin</th>
              </tr>
            </thead>

            <tbody>
              {productRows.length === 0 ? (
                <tr>
                  <td colSpan="5">No sales in selected period.</td>
                </tr>
              ) : (
                productRows.map((row) => (
                  <tr key={row.productName}>
                    <td>
                      <strong>{row.productName}</strong>
                    </td>
                    <td>{row.quantity}</td>
                    <td>{money.format(row.revenue)}</td>
                    <td>{money.format(row.estimatedCost)}</td>
                    <td>
                      {money.format(row.revenue - row.estimatedCost)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="report-two-column">
        <section className="panel report-section">
          <div className="panel-header">
            <div>
              <h3>Category-wise Sales</h3>
              <p>Contribution by category</p>
            </div>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Units</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(categoryReport)
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((row) => (
                    <tr key={row.category}>
                      <td>{row.category}</td>
                      <td>{row.quantity}</td>
                      <td>{money.format(row.revenue)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel report-section">
          <div className="panel-header">
            <div>
              <h3>Payment Method</h3>
              <p>Cash / UPI / Card breakdown</p>
            </div>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Bills</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(paymentReport).map((row) => (
                  <tr key={row.method}>
                    <td>{row.method}</td>
                    <td>{row.bills}</td>
                    <td>{money.format(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel report-section">
        <div className="panel-header">
          <div>
            <h3>Current Inventory / Low Stock</h3>
            <p>Current bottle quantities and valuation</p>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Minimum</th>
                <th>Status</th>
                <th>Purchase Value</th>
                <th>Potential Sales Value</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = inventory[product.id] ?? 0;
                const low = stock <= Number(product.minimumStock ?? 0);

                return (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>{product.category}</td>
                    <td>{stock}</td>
                    <td>{product.minimumStock}</td>
                    <td>
                      <span
                        className={
                          low
                            ? "stock-status low"
                            : "stock-status good"
                        }
                      >
                        {low ? "LOW STOCK" : "IN STOCK"}
                      </span>
                    </td>
                    <td>
                      {money.format(
                        stock * Number(product.purchasePrice ?? 0)
                      )}
                    </td>
                    <td>
                      {money.format(stock * Number(product.price ?? 0))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel report-section">
        <div className="panel-header">
          <div>
            <h3>Purchase Report</h3>
            <p>Supplier receipts in selected period</p>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Purchase</th>
                <th>Supplier</th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Bottles</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    No purchases in selected period.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{purchase.purchaseNumber}</td>
                    <td>{purchase.supplierName}</td>
                    <td>{purchase.invoiceNumber}</td>
                    <td>{purchase.invoiceDate}</td>
                    <td>
                      {purchase.totalUnits ??
                        purchase.items.reduce(
                          (total, item) =>
                            total + Number(item.quantity ?? 0),
                          0
                        )}
                    </td>
                    <td>{money.format(purchase.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="demo-note">
        Profit/margin is an MVP estimate using stored purchase-price data. It
        is not yet an accounting or tax report.
      </div>
    </div>
  );
}
EOF

# ============================================================
# CHAPTER 12 - SETTINGS / BACKUP
# ============================================================

cat > src/pages/Settings.jsx <<'EOF'
import { Download, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useShop } from "../context/ShopContext";

export default function Settings() {
  const {
    products,
    sales,
    purchases,
    createBackup,
    importBackup,
    resetDemo,
  } = useShop();

  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");

  function handleExport() {
    const backup = createBackup();

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download =
      `WineShopPOS-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    setMessage("Backup exported successfully.");
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      const confirmed = window.confirm(
        "Importing a backup will replace current local products, inventory, sales and purchases. Continue?"
      );

      if (!confirmed) {
        event.target.value = "";
        return;
      }

      const result = importBackup(backup);

      if (!result.ok) {
        window.alert(result.message);
      } else {
        setMessage(result.message);
      }
    } catch {
      window.alert("The selected file is not valid JSON.");
    }

    event.target.value = "";
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset products to seed data, restore opening inventory and delete all local sales and purchases?"
    );

    if (confirmed) {
      resetDemo();
      setMessage("Demo data has been reset.");
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Settings & Backup</h2>
          <p>Local MVP configuration and browser data backup</p>
        </div>
      </div>

      {message && (
        <div className="purchase-message success">
          {message}
        </div>
      )}

      <div className="settings-grid">
        <section className="panel">
          <h3>Store Information</h3>

          <div className="settings-fields">
            <label>
              Store Name
              <input value="Demo Wine Shop" readOnly />
            </label>

            <label>
              Currency
              <input value="INR (₹)" readOnly />
            </label>

            <label>
              Data Mode
              <input value="Browser LocalStorage" readOnly />
            </label>

            <label>
              Current Local Data
              <input
                value={
                  `${products.length} products · ` +
                  `${sales.length} sales · ` +
                  `${purchases.length} purchases`
                }
                readOnly
              />
            </label>
          </div>
        </section>

        <section className="panel backup-panel">
          <h3>Backup & Restore</h3>

          <p>
            Export the entire local MVP data set to JSON or restore it later.
          </p>

          <div className="backup-actions">
            <button
              className="primary-button backup-action-button"
              onClick={handleExport}
            >
              <Download size={18} />
              Export JSON Backup
            </button>

            <button
              className="secondary-button backup-action-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} />
              Import JSON Backup
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={handleImport}
            />
          </div>

          <div className="backup-note">
            Backup contains products, inventory, sales and purchase history.
          </div>
        </section>

        <section className="panel danger-zone settings-full-width">
          <h3>Reset Demo</h3>

          <p>
            Restore the original dummy product list and opening inventory, then
            remove all local sales and purchase history.
          </p>

          <button className="danger-button" onClick={handleReset}>
            <RotateCcw size={18} />
            Reset Demo Data
          </button>
        </section>
      </div>
    </div>
  );
}
EOF

# ============================================================
# ROUTES - CHAPTERS 9 TO 12
# ============================================================

cat > src/App.jsx <<'EOF'
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AddProduct from "./pages/AddProduct";
import Dashboard from "./pages/Dashboard";
import EditProduct from "./pages/EditProduct";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import SaleDetails from "./pages/SaleDetails";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />

        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="products/:id/edit" element={<EditProduct />} />

        <Route path="inventory" element={<Inventory />} />
        <Route path="purchases" element={<Purchases />} />

        <Route path="sales" element={<Sales />} />
        <Route path="sales/:id" element={<SaleDetails />} />

        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
EOF

# ============================================================
# EXTRA CSS - SEPARATE FILE
# ============================================================

cat > src/chapters9to12.css <<'EOF'
.discount-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.discount-entry input {
  width: 95px;
  height: 33px;
  padding: 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  outline: none;
  text-align: right;
}

.payment-reference-label {
  margin-top: 14px;
  display: grid;
  gap: 6px;
  color: #cdbfc5;
  font-size: 10px;
  font-weight: 700;
}

.payment-reference-label input {
  width: 100%;
  height: 39px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
  outline: none;
}

.print-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.invoice-card {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  border: 1px solid #e4e5e7;
  border-radius: 14px;
  background: #fff;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  gap: 25px;
  padding-bottom: 22px;
  border-bottom: 1px solid #e9eaec;
}

.invoice-header h2 {
  margin: 8px 0 2px;
}

.invoice-header p {
  margin: 0;
  color: #8a8c94;
  font-size: 12px;
}

.invoice-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: right;
}

.invoice-meta span {
  color: #8a8c94;
  font-size: 11px;
}

.invoice-info-grid {
  margin: 20px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.invoice-info-grid > div {
  padding: 13px;
  border-radius: 8px;
  background: #f7f7f8;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.invoice-info-grid span {
  color: #8a8c94;
  font-size: 9px;
  text-transform: uppercase;
}

.invoice-info-grid strong {
  font-size: 12px;
}

.invoice-barcode {
  margin-top: 3px;
  color: #8c8e94;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
}

.invoice-totals {
  width: min(100%, 360px);
  margin: 22px 0 0 auto;
  display: flex;
  flex-direction: column;
}

.invoice-totals > div {
  padding: 9px 0;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #ececee;
}

.invoice-grand-total {
  margin-top: 4px;
  font-size: 18px;
}

.invoice-footer {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px dashed #d9dade;
  color: #8a8c94;
  font-size: 10px;
  text-align: center;
}

.payment-kpi-grid {
  margin-bottom: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.payment-kpi {
  padding: 15px 17px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e5e6e9;
  border-radius: 11px;
  background: #fff;
}

.payment-kpi > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.payment-kpi span {
  color: #85878e;
  font-size: 10px;
}

.payment-kpi strong {
  font-size: 16px;
}

.dashboard-top-products {
  margin-top: 18px;
}

.report-filter-panel {
  margin-bottom: 17px;
}

.report-filter-grid {
  display: grid;
  grid-template-columns: 180px 180px 1fr;
  gap: 14px;
  align-items: end;
}

.report-filter-grid label {
  display: grid;
  gap: 6px;
  color: #6d7076;
  font-size: 10px;
  font-weight: 700;
}

.report-filter-grid input {
  height: 40px;
  padding: 0 10px;
  border: 1px solid #dcdde0;
  border-radius: 8px;
}

.report-period-note {
  min-height: 40px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #777981;
  font-size: 11px;
}

.report-kpi-grid {
  margin-bottom: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.report-kpi {
  min-height: 115px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #e5e6e9;
  border-radius: 11px;
  background: #fff;
}

.report-kpi span {
  color: #777a81;
  font-size: 10px;
  font-weight: 700;
}

.report-kpi strong {
  margin-top: 5px;
  font-size: 22px;
}

.report-kpi small {
  margin-top: 5px;
  color: #96989e;
}

.report-section {
  margin-bottom: 18px;
}

.report-search {
  margin-bottom: 15px;
}

.report-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.backup-panel p {
  margin: 8px 0 18px;
}

.backup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.backup-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.backup-note {
  margin-top: 15px;
  padding: 10px 12px;
  border-radius: 7px;
  background: #f4f6f8;
  color: #777a81;
  font-size: 10px;
}

.settings-full-width {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .payment-kpi-grid,
  .report-kpi-grid,
  .report-two-column {
    grid-template-columns: 1fr;
  }

  .report-filter-grid {
    grid-template-columns: 1fr;
  }

  .invoice-info-grid {
    grid-template-columns: 1fr;
  }
}

@media print {
  body {
    background: #fff;
  }

  .sidebar,
  .topbar,
  .no-print {
    display: none !important;
  }

  .main-area {
    width: 100%;
    margin-left: 0;
  }

  .page-area {
    padding: 0;
  }

  .invoice-card {
    max-width: none;
    border: 0;
    box-shadow: none;
  }
}
EOF

# Import final chapter CSS only once.
if ! grep -q 'chapters9to12.css' src/main.jsx; then
  sed -i '/import "\.\/index\.css";/a import "./chapters9to12.css";' src/main.jsx
fi

# ============================================================
# DOCUMENTATION - GIT BECOMES PROJECT HANDOFF
# ============================================================

cat > docs/README.md <<'EOF'
# WineShopPOS Documentation

This repository contains both implementation and permanent project documentation.

## Completed local MVP chapters

- Chapter 1 — Project foundation
- Chapter 2 — Application shell
- Chapter 3 — Dummy product master
- Chapter 4 — POS billing
- Chapter 5 — Barcode scanner flow
- Chapter 6 — Local inventory
- Chapter 7 — Receive stock / purchases
- Chapter 8 — Persistent product master
- Chapter 9 — Payments, sales history and invoice detail
- Chapter 10 — Enhanced dashboard
- Chapter 11 — Reports
- Chapter 12 — JSON backup / restore

## Current architecture

React + Vite browser application using LocalStorage for MVP persistence.

No real backend/database is connected yet.

Next major stage begins with database/Supabase chapters.

Read:

- `PROJECT_CONTEXT.md`
- `chapters/`
- `testing/TEST_MATRIX.md`

A future chat should read these files before changing architecture or code.
EOF

cat > docs/PROJECT_CONTEXT.md <<'EOF'
# WineShopPOS Current Project Context

## Repository

GitHub:

`saifsiddiqui59/WineShopPOS`

Local Windows folder:

`E:\WineShopPOS`

Git Bash:

`/e/WineShopPOS`

Branch:

`main`

## Technology

- React
- Vite
- JavaScript
- React Router
- Lucide React
- CSS
- Browser LocalStorage for current MVP

## LocalStorage keys

- `wineshop_products_v1`
- `wineshop_inventory_v1`
- `wineshop_sales_v1`
- `wineshop_purchases_v1`

## Product seed

`src/data/products.js`

contains approximately 50 dummy Indian-market products.

Barcodes/prices are development data only.

## Current completed modules

- Dashboard
- POS Billing
- barcode scanning
- manual product search
- cart
- discount
- Cash / UPI / Card
- optional UPI/Card payment reference
- sale completion
- invoice details
- browser print preview
- Product Master
- Add Product
- Edit Product
- activate / deactivate Product
- Inventory
- Receive Stock
- case + loose-bottle purchase handling
- Purchase History
- Sales History
- Reports
- JSON Export
- JSON Import
- Demo Reset

## Important inventory rules

Product Master = what the item is.

Inventory = how many sellable bottles exist.

Purchases increase inventory.

Sales decrease inventory.

Cases are converted to individual bottle quantities.

Editing product information does not directly overwrite stock.

Inactive products remain historically referenced and cannot be sold/received.

## Current persistence limitation

This is still a single-browser prototype.

LocalStorage is not suitable for a final multi-user shop.

## Planned production backend

Later chapters will introduce:

- Supabase PostgreSQL
- database tables
- transactional stock functions
- Supabase Auth
- ADMIN / MANAGER / CASHIER roles
- RLS
- secure inventory mutations
- audit / stock movements

## Hosting plan

Frontend can be statically hosted on Azure.

Production architecture may later use Azure Static Web Apps or another frontend host depending on authentication/routing needs.

## Scanner test barcode

`8900000010016`

Dummy product:

Kingfisher Strong 650ml
EOF

cat > docs/chapters/08-product-master.md <<'EOF'
# Chapter 8 — Persistent Product Master

Status: COMPLETE

Implemented:

- Product Master persisted in LocalStorage
- Add New Product
- opening stock
- duplicate barcode prevention
- duplicate SKU prevention
- Edit Product
- product edits do not overwrite inventory
- deactivate Product
- reactivate Product
- inactive products excluded from POS
- inactive products excluded from Receive Stock
- inactive products remain in history

LocalStorage:

`wineshop_products_v1`
EOF

cat > docs/chapters/09-payments-sales.md <<'EOF'
# Chapter 9 — Payments & Sales Details

Status: COMPLETE

Implemented:

- Cash payment
- UPI payment
- Card payment
- optional UPI/Card reference
- bill discount
- final total calculation
- sale validation
- inventory reduction
- Sales History
- invoice detail route
- item-level invoice view
- browser print preview

Route:

`/sales/:id`

Receipt printing is currently browser print preview only.

80mm thermal printer optimization remains a later chapter.
EOF

cat > docs/chapters/10-dashboard.md <<'EOF'
# Chapter 10 — Dashboard

Status: COMPLETE

Dashboard now includes:

- Today's Sales
- Bills Today
- Average Bill
- Low Stock count
- Inventory Purchase Value
- Cash Sales Today
- UPI Sales Today
- Card Sales Today
- Recent Sales
- Low Stock Products
- Top Selling Products
EOF

cat > docs/chapters/11-reports.md <<'EOF'
# Chapter 11 — Reports

Status: COMPLETE for local MVP

Implemented:

- date range
- sales total
- purchase total
- product-wise sales
- category-wise sales
- payment-method report
- current inventory
- low stock
- inventory purchase valuation
- potential sales valuation
- estimated gross margin
- purchase report

Important:

Margin/profit values are development estimates based on stored purchase-price information.

This is not yet an accounting, GST or excise-compliance report.
EOF

cat > docs/chapters/12-backup.md <<'EOF'
# Chapter 12 — Backup / Restore

Status: COMPLETE

Implemented:

- Export JSON Backup
- Import JSON Backup
- basic backup-file validation
- restore Products
- restore Inventory
- restore Sales
- restore Purchases
- Demo Reset

Backup format:

```json
{
  "meta": {
    "app": "WineShopPOS",
    "formatVersion": 1
  },
  "data": {
    "products": [],
    "inventory": {},
    "sales": [],
    "purchases": []
  }
}
```

This provides a local recovery mechanism before a real database is connected.
EOF

cat > docs/testing/TEST_MATRIX.md <<'EOF'
# WineShopPOS Test Matrix

## Chapters 1–8

| Test | Expected |
|---|---|
| Vite starts | PASS |
| Production build | PASS |
| Barcode scan | Product enters cart |
| Repeated scan | Quantity increases |
| Out-of-stock check | Sale prevented |
| Sale completion | Sale stored |
| Sale stock update | Inventory decreases |
| Receive Stock | Inventory increases |
| Case conversion | Cases converted to bottles |
| Purchase history | Persists after refresh |
| Add Product | New product persists |
| Opening Stock | Inventory created |
| Duplicate barcode | Rejected |
| Duplicate SKU | Rejected |
| Edit Product | Data changes |
| Edit Product inventory | Stock unchanged |
| Deactivate Product | Product becomes inactive |
| Inactive POS | Product unavailable |
| Inactive Purchases | Product unavailable |

## Chapter 9

| Test | Expected |
|---|---|
| Cash sale | Invoice created |
| UPI sale | Invoice created |
| Card sale | Invoice created |
| Discount | Total reduced correctly |
| Invalid discount | Sale rejected |
| Payment reference | Saved on invoice |
| Sales History | Sale visible |
| Invoice View | Items/totals visible |
| Print Preview | Browser print opens |

## Chapter 10

| Test | Expected |
|---|---|
| Dashboard sales | Reflects today's sales |
| Bills | Today's bill count |
| Payment KPIs | Cash/UPI/Card totals |
| Top products | Based on sold quantity |
| Low stock | Correct products shown |
| Inventory valuation | Purchase-price valuation |

## Chapter 11

| Test | Expected |
|---|---|
| Date filter | Sales/purchases filtered |
| Product report | Units/revenue calculated |
| Category report | Category totals calculated |
| Payment report | Payment totals calculated |
| Inventory report | Current quantities shown |
| Low stock report | Correct threshold |
| Purchase report | Purchases shown |
| Margin estimate | Development calculation |

## Chapter 12

| Test | Expected |
|---|---|
| Export backup | JSON downloaded |
| Backup contains products | Yes |
| Backup contains inventory | Yes |
| Backup contains sales | Yes |
| Backup contains purchases | Yes |
| Import valid backup | Data restored |
| Import invalid JSON | Rejected |
| Import invalid WineShopPOS file | Rejected |
| Reset Demo | Seed state restored |

## Regression

After Chapters 9–12:

1. scan `8900000010016`
2. complete a sale
3. confirm stock decreased
4. receive stock
5. confirm stock increased
6. create a product
7. refresh browser
8. confirm product remains
9. export backup
10. create another sale
11. import earlier backup
12. confirm earlier state is restored
13. run `npm run build`

All above should pass before starting database chapters.
EOF

# ============================================================
# BUILD - SCRIPT STOPS HERE IF CODE HAS AN ERROR
# ============================================================

echo
echo "Running production build..."
npm run build

# ============================================================
# GIT DOCUMENTATION + CODE CHECKPOINT
# ============================================================

echo
echo "Build passed. Creating Git checkpoint..."

git add .

if git diff --cached --quiet; then
  echo "No new Git changes to commit."
else
  git commit -m "Chapters 8-12 - Complete local WineShopPOS MVP and documentation"
fi

git push

echo
echo "============================================================"
echo "SUCCESS"
echo "Chapters 9-12 applied."
echo "Documentation updated."
echo "Production build passed."
echo "Git push completed."
echo "============================================================"
echo
echo "Starting Vite..."
npm run dev -- --open
