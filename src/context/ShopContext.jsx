import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const ShopContext = createContext(null);

function moneyNumber(value) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeProduct(row) {
  return {
    id: row.id,
    barcode: row.barcode ?? "",
    sku: row.sku ?? "",
    name: row.product_name ?? "",
    brand: row.brand ?? "",
    category: row.categories?.name ?? "",
    categoryId: row.category_id ?? null,
    subcategory: row.subcategory ?? "",
    sizeMl: Number(row.size_ml ?? 0),
    size: `${Number(row.size_ml ?? 0)} ml`,
    alcoholPercentage:
      row.alcohol_percentage === null ? null : Number(row.alcohol_percentage),
    purchasePrice: moneyNumber(row.purchase_price),
    mrp: moneyNumber(row.mrp),
    price: moneyNumber(row.selling_price),
    minimumStock: Number(row.minimum_stock ?? 0),
    unitsPerCase: Number(row.units_per_case ?? 1),
    active: row.active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeSale(row, productById) {
  const payment = row.payments?.[0] ?? null;

  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    createdAt: row.created_at,
    cashierId: row.cashier_id,
    paymentMethod: payment?.payment_method ?? "",
    paymentReference: payment?.reference_number ?? "",
    subtotal: moneyNumber(row.subtotal),
    discount: moneyNumber(row.discount),
    grandTotal: moneyNumber(row.grand_total),
    status: row.status,
    items: (row.sale_items ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name_snapshot,
      barcode: item.barcode_snapshot,
      quantity: Number(item.quantity ?? 0),
      unitPrice: moneyNumber(item.unit_price),
      purchasePrice: moneyNumber(productById[item.product_id]?.purchasePrice),
      lineTotal: moneyNumber(item.line_total),
    })),
  };
}

function normalizePurchase(row, productById) {
  const items = (row.purchase_items ?? []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    productName: productById[item.product_id]?.name ?? "Product",
    barcode: productById[item.product_id]?.barcode ?? "",
    purchaseUnit: item.purchase_unit,
    caseCount: Number(item.case_count ?? 0),
    unitsPerCase: Number(item.units_per_case ?? 1),
    looseBottles: Number(item.loose_bottles ?? 0),
    quantity: Number(item.quantity ?? 0),
    purchasePrice: moneyNumber(item.purchase_price),
    lineTotal: moneyNumber(item.line_total),
  }));

  return {
    id: row.id,
    purchaseNumber: row.purchase_number,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name_snapshot ?? "Supplier",
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    createdAt: row.created_at,
    notes: row.notes ?? "",
    total: moneyNumber(row.total),
    totalUnits: items.reduce((sum, item) => sum + item.quantity, 0),
    items,
  };
}

export function ShopProvider({ children }) {
  const { user, profile, access } = useAuth();

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({});
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");

  const canUseShop = Boolean(user && profile?.active && access?.allowed);

  const refreshAll = useCallback(async () => {
    if (!canUseShop) {
      setProducts([]);
      setInventory({});
      setSales([]);
      setPurchases([]);
      setCategories([]);
      setSuppliers([]);
      return { ok: false, message: "Shop session is not active." };
    }

    setLoadingData(true);
    setDataError("");

    try {
      const [
        categoriesResult,
        suppliersResult,
        productsResult,
        inventoryResult,
      ] = await Promise.all([
        supabase
          .from("categories")
          .select("id,name,active")
          .order("name"),
        supabase
          .from("suppliers")
          .select("id,supplier_name,active")
          .order("supplier_name"),
        supabase
          .from("products")
          .select("*, categories(name)")
          .order("product_name"),
        supabase
          .from("inventory")
          .select("product_id,quantity,reserved_quantity"),
      ]);

      for (const result of [
        categoriesResult,
        suppliersResult,
        productsResult,
        inventoryResult,
      ]) {
        if (result.error) throw result.error;
      }

      const normalizedProducts = (productsResult.data ?? []).map(normalizeProduct);
      const productById = Object.fromEntries(
        normalizedProducts.map((product) => [product.id, product])
      );

      const stockMap = {};
      for (const row of inventoryResult.data ?? []) {
        stockMap[row.product_id] = Number(row.quantity ?? 0);
      }

      let salesQuery = supabase
        .from("sales")
        .select(`
          id, invoice_number, subtotal, discount, grand_total,
          payment_status, cashier_id, status, notes, created_at,
          sale_items(
            id, product_id, product_name_snapshot, barcode_snapshot,
            quantity, unit_price, discount, line_total
          ),
          payments(
            id, payment_method, amount, reference_number, created_at
          )
        `)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (profile?.role === "CASHIER") {
        salesQuery = salesQuery.eq("cashier_id", profile.user_id);
      }

      const [salesResult, purchasesResult] = await Promise.all([
        salesQuery,
        profile?.role === "CASHIER"
          ? Promise.resolve({ data: [], error: null })
          : supabase
              .from("purchases")
              .select(`
                id, purchase_number, supplier_id, supplier_name_snapshot,
                invoice_number, invoice_date, subtotal, tax, total,
                status, notes, created_at,
                purchase_items(
                  id, product_id, quantity, purchase_unit,
                  case_count, units_per_case, loose_bottles,
                  purchase_price, line_total
                )
              `)
              .order("created_at", { ascending: false })
              .limit(1000),
      ]);

      if (salesResult.error) throw salesResult.error;
      if (purchasesResult.error) throw purchasesResult.error;

      setCategories(categoriesResult.data ?? []);
      setSuppliers(suppliersResult.data ?? []);
      setProducts(normalizedProducts);
      setInventory(stockMap);
      setSales(
        (salesResult.data ?? []).map((row) => normalizeSale(row, productById))
      );
      setPurchases(
        (purchasesResult.data ?? []).map((row) =>
          normalizePurchase(row, productById)
        )
      );

      return { ok: true };
    } catch (error) {
      const message = error?.message || String(error);
      setDataError(message);
      return { ok: false, message };
    } finally {
      setLoadingData(false);
    }
  }, [canUseShop, profile?.role, profile?.user_id]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  function getStock(productId) {
    return Number(inventory[productId] ?? 0);
  }

  async function ensureCategory(name) {
    const categoryName = String(name ?? "").trim();
    if (!categoryName) return null;

    const existing = categories.find(
      (item) => item.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (existing) return existing.id;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        shop_id: profile.shop_id,
        name: categoryName,
        active: true,
      })
      .select("id,name,active")
      .single();

    if (error) throw error;
    setCategories((current) => [...current, data].sort((a, b) =>
      a.name.localeCompare(b.name)
    ));
    return data.id;
  }

  function validateProduct(data, includeOpeningStock = false) {
    const value = {
      barcode: String(data.barcode ?? "").trim(),
      sku: String(data.sku ?? "").trim().toUpperCase(),
      name: String(data.name ?? "").trim(),
      brand: String(data.brand ?? "").trim(),
      category: String(data.category ?? "").trim(),
      subcategory: String(data.subcategory ?? "").trim(),
      sizeMl: Number(data.sizeMl),
      alcoholPercentage:
        data.alcoholPercentage === "" ||
        data.alcoholPercentage === null ||
        data.alcoholPercentage === undefined
          ? null
          : Number(data.alcoholPercentage),
      purchasePrice: Number(data.purchasePrice),
      mrp: Number(data.mrp),
      price: Number(data.price),
      minimumStock: Number(data.minimumStock),
      unitsPerCase: Number(data.unitsPerCase),
      openingStock: includeOpeningStock ? Number(data.openingStock ?? 0) : 0,
    };

    if (!value.barcode) return { ok: false, message: "Barcode is required." };
    if (!value.sku) return { ok: false, message: "SKU is required." };
    if (!value.name) return { ok: false, message: "Product name is required." };
    if (!value.brand) return { ok: false, message: "Brand is required." };
    if (!value.category) return { ok: false, message: "Category is required." };
    if (!Number.isInteger(value.sizeMl) || value.sizeMl <= 0) {
      return { ok: false, message: "Bottle size is invalid." };
    }
    if (!Number.isFinite(value.purchasePrice) || value.purchasePrice < 0) {
      return { ok: false, message: "Purchase price is invalid." };
    }
    if (!Number.isFinite(value.mrp) || value.mrp < 0) {
      return { ok: false, message: "MRP is invalid." };
    }
    if (!Number.isFinite(value.price) || value.price < 0) {
      return { ok: false, message: "Selling price is invalid." };
    }
    if (!Number.isInteger(value.minimumStock) || value.minimumStock < 0) {
      return { ok: false, message: "Minimum stock is invalid." };
    }
    if (!Number.isInteger(value.unitsPerCase) || value.unitsPerCase <= 0) {
      return { ok: false, message: "Bottles per case is invalid." };
    }
    if (
      includeOpeningStock &&
      (!Number.isInteger(value.openingStock) || value.openingStock < 0)
    ) {
      return { ok: false, message: "Opening stock is invalid." };
    }
    return { ok: true, value };
  }

  async function addProduct(productData) {
    try {
      const validation = validateProduct(productData, true);
      if (!validation.ok) return validation;

      const v = validation.value;
      const categoryId = await ensureCategory(v.category);

      const { data, error } = await supabase.rpc("create_new_product", {
        p_barcode: v.barcode,
        p_sku: v.sku,
        p_product_name: v.name,
        p_brand: v.brand,
        p_category_id: categoryId,
        p_subcategory: v.subcategory || null,
        p_size_ml: v.sizeMl,
        p_alcohol_percentage: v.alcoholPercentage,
        p_purchase_price: v.purchasePrice,
        p_mrp: v.mrp,
        p_selling_price: v.price,
        p_minimum_stock: v.minimumStock,
        p_units_per_case: v.unitsPerCase,
        p_opening_stock: v.openingStock,
      });

      if (error) throw error;
      await refreshAll();

      return {
        ok: true,
        productId: data,
        message: `${v.name} created successfully.`,
      };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  async function updateProduct(productId, productData) {
    try {
      const validation = validateProduct(productData, false);
      if (!validation.ok) return validation;

      const v = validation.value;
      const categoryId = await ensureCategory(v.category);

      const { error } = await supabase
        .from("products")
        .update({
          barcode: v.barcode,
          sku: v.sku,
          product_name: v.name,
          brand: v.brand,
          category_id: categoryId,
          subcategory: v.subcategory || null,
          size_ml: v.sizeMl,
          alcohol_percentage: v.alcoholPercentage,
          purchase_price: v.purchasePrice,
          mrp: v.mrp,
          selling_price: v.price,
          minimum_stock: v.minimumStock,
          units_per_case: v.unitsPerCase,
        })
        .eq("id", productId);

      if (error) throw error;
      await refreshAll();
      return { ok: true, message: `${v.name} updated successfully.` };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  async function setProductStatus(productId, active) {
    try {
      const { error } = await supabase
        .from("products")
        .update({ active })
        .eq("id", productId);

      if (error) throw error;
      await refreshAll();
      return {
        ok: true,
        message: active ? "Product activated." : "Product deactivated.",
      };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  async function deactivateProduct(productId) {
    return setProductStatus(productId, false);
  }

  async function activateProduct(productId) {
    return setProductStatus(productId, true);
  }

  async function completeSale(
    cart,
    paymentMethod,
    { discount = 0, paymentReference = "" } = {}
  ) {
    try {
      if (!cart?.length) return { ok: false, message: "Cart is empty." };

      const { data, error } = await supabase.rpc("complete_sale", {
        p_items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: Number(item.quantity),
        })),
        p_payment_method: paymentMethod,
        p_discount: Number(discount || 0),
        p_payment_reference: String(paymentReference ?? "").trim() || null,
      });

      if (error) throw error;
      await refreshAll();

      const sale = sales.find((item) => item.id === data) ?? { id: data };
      return { ok: true, sale: { ...sale, id: data } };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  async function ensureSupplier(supplierName) {
    const name = String(supplierName ?? "").trim();
    if (!name) throw new Error("Supplier name is required.");

    const existing = suppliers.find(
      (item) => item.supplier_name.toLowerCase() === name.toLowerCase()
    );

    if (existing) return existing.id;

    const { data, error } = await supabase
      .from("suppliers")
      .insert({
        shop_id: profile.shop_id,
        supplier_name: name,
        active: true,
      })
      .select("id,supplier_name,active")
      .single();

    if (error) throw error;
    setSuppliers((current) => [...current, data]);
    return data.id;
  }

  async function receiveStock({
    supplierName,
    invoiceNumber,
    invoiceDate,
    items,
    notes = "",
  }) {
    try {
      if (!items?.length) {
        return { ok: false, message: "Add at least one product." };
      }

      const supplierId = await ensureSupplier(supplierName);

      const payloadItems = items.map((item) => ({
        product_id: item.productId,
        case_count: Number(item.caseCount ?? 0),
        units_per_case: Number(item.unitsPerCase ?? 1),
        loose_bottles: Number(item.looseBottles ?? 0),
        quantity: Number(item.quantity),
        purchase_price: Number(item.purchasePrice),
      }));

      const { data, error } = await supabase.rpc("receive_purchase", {
        p_supplier_id: supplierId,
        p_invoice_number: String(invoiceNumber ?? "").trim(),
        p_invoice_date:
          invoiceDate || new Date().toISOString().slice(0, 10),
        p_items: payloadItems,
        p_notes: notes || null,
      });

      if (error) throw error;
      await refreshAll();

      return {
        ok: true,
        purchaseId: data,
        message: "Stock received successfully.",
      };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  async function adjustStock({
    productId,
    adjustmentType,
    quantityChange,
    reason,
    notes = "",
  }) {
    try {
      const { data, error } = await supabase.rpc("adjust_stock", {
        p_product_id: productId,
        p_adjustment_type: adjustmentType,
        p_quantity_change: Number(quantityChange),
        p_reason: String(reason ?? "").trim(),
        p_notes: notes || null,
      });

      if (error) throw error;
      await refreshAll();
      return { ok: true, quantity: data, message: "Stock adjusted." };
    } catch (error) {
      return { ok: false, message: error?.message || String(error) };
    }
  }

  function createBackup() {
    return {
      meta: {
        app: "WineShopPOS",
        mode: "SUPABASE_CLOUD",
        exportedAt: new Date().toISOString(),
      },
      data: { products, inventory, sales, purchases },
    };
  }

  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.active !== false &&
          getStock(product.id) <= product.minimumStock
      ),
    [products, inventory]
  );

  return (
    <ShopContext.Provider
      value={{
        products,
        inventory,
        sales,
        purchases,
        categories,
        suppliers,
        loadingData,
        dataError,
        lowStockProducts,
        getStock,
        refreshAll,
        addProduct,
        updateProduct,
        deactivateProduct,
        activateProduct,
        completeSale,
        receiveStock,
        adjustStock,
        createBackup,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside ShopProvider");
  return context;
}
