import { createContext, useContext, useEffect, useState } from "react";
import { products } from "../data/products";

const ShopContext = createContext(null);

const INVENTORY_KEY = "wineshop_inventory_v1";
const SALES_KEY = "wineshop_sales_v1";

function createInitialInventory() {
  let saved = {};

  try {
    saved = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || {};
  } catch {
    saved = {};
  }

  return products.reduce((result, product) => {
    result[product.id] =
      typeof saved[product.id] === "number"
        ? saved[product.id]
        : product.openingStock;

    return result;
  }, {});
}

function createInitialSales() {
  try {
    return JSON.parse(localStorage.getItem(SALES_KEY)) || [];
  } catch {
    return [];
  }
}

export function ShopProvider({ children }) {
  const [inventory, setInventory] = useState(createInitialInventory);
  const [sales, setSales] = useState(createInitialSales);

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }, [sales]);

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
      const available = inventory[item.product.id] ?? 0;

      if (item.quantity > available) {
        return {
          ok: false,
          message: `Only ${available} unit(s) of ${item.product.name} are available.`,
        };
      }
    }

    const updatedInventory = { ...inventory };

    cart.forEach((item) => {
      updatedInventory[item.product.id] -= item.quantity;
    });

    const subtotal = cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    const invoiceNumber = `INV-${new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "")}-${String(sales.length + 1).padStart(4, "0")}`;

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
        lineTotal: item.product.price * item.quantity,
      })),
    };

    setInventory(updatedInventory);
    setSales((currentSales) => [sale, ...currentSales]);

    return {
      ok: true,
      sale,
    };
  }

  function resetDemo() {
    const initialInventory = products.reduce((result, product) => {
      result[product.id] = product.openingStock;
      return result;
    }, {});

    setInventory(initialInventory);
    setSales([]);
  }

  return (
    <ShopContext.Provider
      value={{
        products,
        inventory,
        sales,
        getStock,
        completeSale,
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
