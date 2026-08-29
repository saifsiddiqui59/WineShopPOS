import { createContext, useContext, useEffect, useState } from "react";
import { products as seedProducts } from "../data/products";

const ShopContext = createContext(null);

const INVENTORY_KEY = "wineshop_inventory_v1";
const SALES_KEY = "wineshop_sales_v1";
const PURCHASES_KEY = "wineshop_purchases_v1";

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function createInitialInventory() {
  const savedInventory = loadJSON(INVENTORY_KEY, {});

  return seedProducts.reduce((result, product) => {
    result[product.id] =
      typeof savedInventory[product.id] === "number"
        ? savedInventory[product.id]
        : product.openingStock;

    return result;
  }, {});
}

function createInitialSales() {
  return loadJSON(SALES_KEY, []);
}

function createInitialPurchases() {
  return loadJSON(PURCHASES_KEY, []);
}

export function ShopProvider({ children }) {
  const [products] = useState(seedProducts);

  const [inventory, setInventory] = useState(
    createInitialInventory
  );

  const [sales, setSales] = useState(
    createInitialSales
  );

  const [purchases, setPurchases] = useState(
    createInitialPurchases
  );

  useEffect(() => {
    localStorage.setItem(
      INVENTORY_KEY,
      JSON.stringify(inventory)
    );
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(
      SALES_KEY,
      JSON.stringify(sales)
    );
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(
      PURCHASES_KEY,
      JSON.stringify(purchases)
    );
  }, [purchases]);

  function getStock(productId) {
    return inventory[productId] ?? 0;
  }

  function completeSale(cart, paymentMethod) {
    if (!cart.length) {
      return {
        ok: false,
        message: "Cart is empty.",
      };
    }

    for (const item of cart) {
      const available =
        inventory[item.product.id] ?? 0;

      if (item.quantity > available) {
        return {
          ok: false,
          message:
            `Only ${available} unit(s) of ` +
            `${item.product.name} are available.`,
        };
      }
    }

    const updatedInventory = { ...inventory };

    cart.forEach((item) => {
      updatedInventory[item.product.id] -=
        item.quantity;
    });

    const subtotal = cart.reduce(
      (total, item) =>
        total +
        item.product.price * item.quantity,
      0
    );

    const invoiceNumber =
      `INV-${new Date()
        .toISOString()
        .slice(0, 10)
        .replaceAll("-", "")}-` +
      `${String(sales.length + 1).padStart(
        4,
        "0"
      )}`;

    const sale = {
      id: crypto.randomUUID(),
      invoiceNumber,
      createdAt: new Date().toISOString(),
      paymentMethod,
      subtotal,
      discount: 0,
      grandTotal: subtotal,

      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        barcode: item.product.barcode,
        quantity: item.quantity,
        unitPrice: item.product.price,
        lineTotal:
          item.product.price *
          item.quantity,
      })),
    };

    setInventory(updatedInventory);

    setSales((currentSales) => [
      sale,
      ...currentSales,
    ]);

    return {
      ok: true,
      sale,
    };
  }

  function receiveStock({
    supplierName,
    invoiceNumber,
    invoiceDate,
    items,
    notes = "",
  }) {
    if (!supplierName?.trim()) {
      return {
        ok: false,
        message: "Supplier name is required.",
      };
    }

    if (!invoiceNumber?.trim()) {
      return {
        ok: false,
        message:
          "Supplier invoice number is required.",
      };
    }

    if (!items?.length) {
      return {
        ok: false,
        message: "Add at least one product.",
      };
    }

    const duplicateInvoice = purchases.some(
      (purchase) =>
        purchase.invoiceNumber
          .trim()
          .toLowerCase() ===
        invoiceNumber.trim().toLowerCase()
    );

    if (duplicateInvoice) {
      return {
        ok: false,
        message:
          "This supplier invoice already exists.",
      };
    }

    const updatedInventory = {
      ...inventory,
    };

    const purchaseItems = [];

    for (const item of items) {
      const product = products.find(
        (productItem) =>
          productItem.id === item.productId
      );

      if (!product) {
        return {
          ok: false,
          message:
            "Invalid product selected.",
        };
      }

      const quantity =
        Number(item.quantity);

      const purchasePrice =
        Number(item.purchasePrice);

      const caseCount =
        Number(item.caseCount) || 0;

      const unitsPerCase =
        Number(item.unitsPerCase) || 1;

      const looseBottles =
        Number(item.looseBottles) || 0;

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return {
          ok: false,
          message:
            `Invalid quantity for ${product.name}.`,
        };
      }

      if (
        Number.isNaN(purchasePrice) ||
        purchasePrice < 0
      ) {
        return {
          ok: false,
          message:
            `Invalid purchase price for ${product.name}.`,
        };
      }

      if (
        caseCount < 0 ||
        looseBottles < 0 ||
        unitsPerCase <= 0
      ) {
        return {
          ok: false,
          message:
            `Invalid case information for ${product.name}.`,
        };
      }

      const stockBefore =
        updatedInventory[product.id] ?? 0;

      const stockAfter =
        stockBefore + quantity;

      updatedInventory[product.id] =
        stockAfter;

      purchaseItems.push({
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,

        purchaseUnit:
          caseCount > 0
            ? "CASE"
            : "BOTTLE",

        caseCount,

        unitsPerCase,

        looseBottles,

        quantity,

        purchasePrice,

        lineTotal:
          quantity * purchasePrice,

        stockBefore,

        stockAfter,
      });
    }

    const total =
      purchaseItems.reduce(
        (sum, item) =>
          sum + item.lineTotal,
        0
      );

    const totalUnits =
      purchaseItems.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );

    const purchaseNumber =
      `PUR-${new Date()
        .toISOString()
        .slice(0, 10)
        .replaceAll("-", "")}-` +
      `${String(
        purchases.length + 1
      ).padStart(4, "0")}`;

    const purchase = {
      id: crypto.randomUUID(),

      purchaseNumber,

      supplierName:
        supplierName.trim(),

      invoiceNumber:
        invoiceNumber.trim(),

      invoiceDate:
        invoiceDate ||
        new Date()
          .toISOString()
          .slice(0, 10),

      createdAt:
        new Date().toISOString(),

      notes,

      total,

      totalUnits,

      items: purchaseItems,
    };

    setInventory(updatedInventory);

    setPurchases((currentPurchases) => [
      purchase,
      ...currentPurchases,
    ]);

    return {
      ok: true,
      purchase,
    };
  }

  function resetDemo() {
    const initialInventory =
      products.reduce(
        (result, product) => {
          result[product.id] =
            product.openingStock;

          return result;
        },
        {}
      );

    setInventory(initialInventory);
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
        completeSale,
        receiveStock,
        resetDemo,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context =
    useContext(ShopContext);

  if (!context) {
    throw new Error(
      "useShop must be used inside ShopProvider"
    );
  }

  return context;
}
