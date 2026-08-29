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
