import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { listOfflineSales, queueOfflineSale, removeOfflineSale, setOfflineSaleStatus } from "../lib/offlineQueue";

const ShopContext = createContext(null);
const DATA_CACHE_KEY = "wineshop_cloud_cache_v2";

const num = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;

function normalizeProduct(row) {
  return {
    id: row.id, barcode: row.barcode ?? "", sku: row.sku ?? "", name: row.product_name ?? "",
    brand: row.brand ?? "", category: row.category_name ?? row.categories?.name ?? "", categoryId: row.category_id ?? null,
    subcategory: row.subcategory ?? "", sizeMl: num(row.size_ml), size: `${num(row.size_ml)} ml`,
    alcoholPercentage: row.alcohol_percentage == null ? null : num(row.alcohol_percentage),
    purchasePrice: row.purchase_price == null ? 0 : num(row.purchase_price), mrp: num(row.mrp), price: num(row.selling_price),
    minimumStock: num(row.minimum_stock), unitsPerCase: num(row.units_per_case) || 1, active: row.active !== false,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function normalizeSale(row, productById) {
  const payment = (row.payments || []).find((p) => p.payment_type !== "REFUND") || row.payments?.[0] || null;
  return {
    id: row.id, invoiceNumber: row.invoice_number, createdAt: row.created_at, cashierId: row.cashier_id,
    shiftId: row.shift_id, clientSaleId: row.client_sale_id, offlineCreatedAt: row.offline_created_at,
    paymentMethod: payment?.payment_method ?? "", paymentReference: payment?.reference_number ?? "",
    subtotal: num(row.subtotal), discount: num(row.discount), grandTotal: num(row.grand_total), status: row.status,
    items: (row.sale_items || []).map((item) => ({ id: item.id, productId: item.product_id,
      productName: item.product_name_snapshot, barcode: item.barcode_snapshot, quantity: num(item.quantity),
      unitPrice: num(item.unit_price), purchasePrice: num(productById[item.product_id]?.purchasePrice), lineTotal: num(item.line_total) })),
  };
}

function normalizePurchase(row, productById) {
  const items = (row.purchase_items || []).map((item) => ({ id: item.id, productId: item.product_id,
    productName: productById[item.product_id]?.name ?? "Product", barcode: productById[item.product_id]?.barcode ?? "",
    purchaseUnit: item.purchase_unit, caseCount: num(item.case_count), unitsPerCase: num(item.units_per_case) || 1,
    looseBottles: num(item.loose_bottles), quantity: num(item.quantity), purchasePrice: num(item.purchase_price), lineTotal: num(item.line_total) }));
  return { id: row.id, purchaseNumber: row.purchase_number, supplierId: row.supplier_id,
    supplierName: row.supplier_name_snapshot ?? "Supplier", invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date, createdAt: row.created_at, notes: row.notes ?? "", total: num(row.total),
    totalUnits: items.reduce((s, i) => s + i.quantity, 0), items };
}

function readCache() { try { return JSON.parse(localStorage.getItem(DATA_CACHE_KEY) || "null"); } catch { return null; } }
function writeCache(data) { try { localStorage.setItem(DATA_CACHE_KEY, JSON.stringify({ ...data, cachedAt: new Date().toISOString() })); } catch {} }

export function ShopProvider({ children }) {
  const { user, profile, access } = useAuth();
  const cached = readCache();
  const [products, setProducts] = useState(cached?.products || []);
  const [inventory, setInventory] = useState(cached?.inventory || {});
  const [sales, setSales] = useState(cached?.sales || []);
  const [purchases, setPurchases] = useState(cached?.purchases || []);
  const [categories, setCategories] = useState(cached?.categories || []);
  const [suppliers, setSuppliers] = useState(cached?.suppliers || []);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const canUseShop = Boolean(user && profile?.active && access?.allowed);

  const refreshAll = useCallback(async () => {
    if (!canUseShop) return { ok: false, message: "Shop session is not active." };
    if (!navigator.onLine) {
      const c = readCache();
      if (c) { setProducts(c.products || []); setInventory(c.inventory || {}); setSales(c.sales || []); setPurchases(c.purchases || []); setCategories(c.categories || []); setSuppliers(c.suppliers || []); }
      return { ok: Boolean(c), offline: true, message: c ? "Using cached offline data." : "No cached shop data." };
    }
    setLoadingData(true); setDataError("");
    try {
      const [categoriesResult, suppliersResult, productsResult, inventoryResult] = await Promise.all([
        supabase.from("categories").select("id,name,active").order("name"),
        profile?.role === "CASHIER" ? Promise.resolve({ data: [], error: null }) : supabase.from("suppliers").select("id,supplier_name,active").order("supplier_name"),
        supabase.rpc("get_products"),
        supabase.from("inventory").select("product_id,quantity,reserved_quantity"),
      ]);
      for (const r of [categoriesResult, suppliersResult, productsResult, inventoryResult]) if (r.error) throw r.error;
      const normalizedProducts = (productsResult.data || []).map(normalizeProduct);
      const productById = Object.fromEntries(normalizedProducts.map((p) => [p.id, p]));
      const stockMap = Object.fromEntries((inventoryResult.data || []).map((r) => [r.product_id, num(r.quantity)]));
      let salesQuery = supabase.from("sales").select(`id,invoice_number,subtotal,discount,grand_total,payment_status,cashier_id,status,notes,created_at,shift_id,client_sale_id,offline_created_at,sale_items(id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,discount,line_total),payments(id,payment_method,amount,reference_number,payment_type,created_at)`).order("created_at", { ascending: false }).limit(1000);
      if (profile?.role === "CASHIER") salesQuery = salesQuery.eq("cashier_id", profile.user_id);
      const [salesResult, purchasesResult] = await Promise.all([
        salesQuery,
        profile?.role === "CASHIER" ? Promise.resolve({ data: [], error: null }) : supabase.from("purchases").select(`id,purchase_number,supplier_id,supplier_name_snapshot,invoice_number,invoice_date,subtotal,tax,total,status,notes,created_at,purchase_items(id,product_id,quantity,purchase_unit,case_count,units_per_case,loose_bottles,purchase_price,line_total)`).order("created_at", { ascending: false }).limit(1000),
      ]);
      if (salesResult.error) throw salesResult.error; if (purchasesResult.error) throw purchasesResult.error;
      const nextSales = (salesResult.data || []).map((r) => normalizeSale(r, productById));
      const nextPurchases = (purchasesResult.data || []).map((r) => normalizePurchase(r, productById));
      setCategories(categoriesResult.data || []); setSuppliers(suppliersResult.data || []); setProducts(normalizedProducts);
      setInventory(stockMap); setSales(nextSales); setPurchases(nextPurchases);
      writeCache({ products: normalizedProducts, inventory: stockMap, sales: nextSales, purchases: nextPurchases, categories: categoriesResult.data || [], suppliers: suppliersResult.data || [] });
      return { ok: true };
    } catch (error) {
      const message = error?.message || String(error); setDataError(message);
      const c = readCache();
      if (!navigator.onLine && c) return { ok: true, offline: true, message: "Using cached shop data." };
      return { ok: false, message };
    } finally { setLoadingData(false); }
  }, [canUseShop, profile?.role, profile?.user_id]);

  useEffect(() => { refreshAll(); }, [refreshAll]);
  useEffect(() => { const fn = () => refreshAll(); window.addEventListener("online", fn); return () => window.removeEventListener("online", fn); }, [refreshAll]);

  const getStock = (id) => num(inventory[id]);

  async function ensureCategory(name) {
    const categoryName = String(name || "").trim(); if (!categoryName) return null;
    const existing = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase()); if (existing) return existing.id;
    const { data, error } = await supabase.from("categories").insert({ shop_id: profile.shop_id, name: categoryName, active: true }).select("id,name,active").single();
    if (error) throw error; setCategories((c) => [...c, data]); return data.id;
  }

  function validateProduct(d, opening = false) {
    const v = { barcode:String(d.barcode||"").trim(),sku:String(d.sku||"").trim().toUpperCase(),name:String(d.name||"").trim(),brand:String(d.brand||"").trim(),category:String(d.category||"").trim(),subcategory:String(d.subcategory||"").trim(),sizeMl:Number(d.sizeMl),alcoholPercentage:d.alcoholPercentage===""?null:Number(d.alcoholPercentage),purchasePrice:Number(d.purchasePrice),mrp:Number(d.mrp),price:Number(d.price),minimumStock:Number(d.minimumStock),unitsPerCase:Number(d.unitsPerCase),openingStock:opening?Number(d.openingStock||0):0 };
    for (const [key,label] of [["barcode","Barcode"],["sku","SKU"],["name","Product name"],["brand","Brand"],["category","Category"]]) if (!v[key]) return { ok:false,message:`${label} is required.` };
    if (!Number.isInteger(v.sizeMl)||v.sizeMl<=0) return {ok:false,message:"Bottle size is invalid."};
    if (![v.purchasePrice,v.mrp,v.price].every((x)=>Number.isFinite(x)&&x>=0)) return {ok:false,message:"Price values are invalid."};
    if (!Number.isInteger(v.minimumStock)||v.minimumStock<0||!Number.isInteger(v.unitsPerCase)||v.unitsPerCase<=0) return {ok:false,message:"Stock settings are invalid."};
    if (opening&&(!Number.isInteger(v.openingStock)||v.openingStock<0)) return {ok:false,message:"Opening stock is invalid."};
    return {ok:true,value:v};
  }

  async function addProduct(data) {
    try { const check=validateProduct(data,true); if(!check.ok)return check; const v=check.value; const categoryId=await ensureCategory(v.category);
      const {data:id,error}=await supabase.rpc("create_new_product",{p_barcode:v.barcode,p_sku:v.sku,p_product_name:v.name,p_brand:v.brand,p_category_id:categoryId,p_subcategory:v.subcategory||null,p_size_ml:v.sizeMl,p_alcohol_percentage:v.alcoholPercentage,p_purchase_price:v.purchasePrice,p_mrp:v.mrp,p_selling_price:v.price,p_minimum_stock:v.minimumStock,p_units_per_case:v.unitsPerCase,p_opening_stock:v.openingStock});
      if(error)throw error; await refreshAll(); return {ok:true,productId:id,message:`${v.name} created successfully.`};
    } catch(e){return {ok:false,message:e.message||String(e)}}
  }

  async function updateProduct(id,data) {
    try { const check=validateProduct(data,false); if(!check.ok)return check; const v=check.value; const categoryId=await ensureCategory(v.category);
      const {error}=await supabase.rpc("update_product_details",{p_product_id:id,p_barcode:v.barcode,p_sku:v.sku,p_product_name:v.name,p_brand:v.brand,p_category_id:categoryId,p_subcategory:v.subcategory||"",p_size_ml:v.sizeMl,p_alcohol_percentage:v.alcoholPercentage,p_purchase_price:v.purchasePrice,p_mrp:v.mrp,p_selling_price:v.price,p_minimum_stock:v.minimumStock,p_units_per_case:v.unitsPerCase});
      if(error)throw error;await refreshAll();return {ok:true,message:`${v.name} updated successfully.`};
    }catch(e){return {ok:false,message:e.message||String(e)}}
  }
  async function setProductStatus(id,active){try{const {error}=await supabase.rpc("set_product_active",{p_product_id:id,p_active:active});if(error)throw error;await refreshAll();return{ok:true,message:active?"Product activated.":"Product deactivated."}}catch(e){return{ok:false,message:e.message||String(e)}}}
  const deactivateProduct=(id)=>setProductStatus(id,false); const activateProduct=(id)=>setProductStatus(id,true);

  async function completeSale(cart,paymentMethod,{discount=0,paymentReference=""}={}) {
    const clientSaleId=crypto.randomUUID();
    const payload={clientSaleId,offlineCreatedAt:new Date().toISOString(),items:cart.map((i)=>({product_id:i.product.id,quantity:Number(i.quantity)})),paymentMethod,discount:Number(discount||0),paymentReference:String(paymentReference||"").trim()||null,cartSnapshot:cart.map((i)=>({product:{id:i.product.id,name:i.product.name,barcode:i.product.barcode,price:i.product.price},quantity:Number(i.quantity)}))};
    if (!navigator.onLine) {
      try {
        await queueOfflineSale(payload);
        setInventory((current)=>{const next={...current};for(const item of cart)next[item.product.id]=Math.max(0,num(next[item.product.id])-Number(item.quantity));return next;});
        const offlineSale={id:`offline-${clientSaleId}`,invoiceNumber:`OFFLINE-${clientSaleId.slice(0,8).toUpperCase()}`,createdAt:payload.offlineCreatedAt,paymentMethod,paymentReference,subtotal:cart.reduce((s,i)=>s+i.product.price*i.quantity,0),discount:Number(discount||0),grandTotal:Math.max(0,cart.reduce((s,i)=>s+i.product.price*i.quantity,0)-Number(discount||0)),status:"OFFLINE_PENDING",items:cart.map((i)=>({productId:i.product.id,productName:i.product.name,barcode:i.product.barcode,quantity:i.quantity,unitPrice:i.product.price,lineTotal:i.product.price*i.quantity}))};
        setSales((s)=>[offlineSale,...s]); return {ok:true,offline:true,sale:offlineSale,message:"Sale saved securely offline. Sync when internet returns."};
      } catch(e){return{ok:false,message:e.message||String(e)}}
    }
    try {
      const {data,error}=await supabase.rpc("complete_sale_v2",{p_items:payload.items,p_payment_method:paymentMethod,p_discount:Number(discount||0),p_payment_reference:paymentReference||null,p_client_sale_id:clientSaleId,p_offline_created_at:null});
      if(error)throw error;await refreshAll();return{ok:true,sale:{id:data}};
    }catch(e){return{ok:false,message:e.message||String(e)}}
  }

  async function syncOfflineSales() {
    if (!navigator.onLine) return {ok:false,message:"Internet is offline."};
    const rows=await listOfflineSales(); let synced=0,conflicts=0;
    for(const row of rows.filter((r)=>r.status==="PENDING"||r.status==="CONFLICT")){
      if(!row.payload){await setOfflineSaleStatus(row.id,"CONFLICT","Unable to decrypt local sale");conflicts++;continue;}
      const p=row.payload;
      const {error}=await supabase.rpc("sync_offline_sale",{p_client_sale_id:p.clientSaleId,p_offline_created_at:p.offlineCreatedAt,p_items:p.items,p_payment_method:p.paymentMethod,p_discount:p.discount,p_payment_reference:p.paymentReference});
      if(error){await setOfflineSaleStatus(row.id,"CONFLICT",error.message);conflicts++;}else{await removeOfflineSale(row.id);synced++;}
    }
    await refreshAll();return{ok:conflicts===0,synced,conflicts,message:`Synced ${synced}; conflicts ${conflicts}.`};
  }

  async function ensureSupplier(name){const n=String(name||"").trim();if(!n)throw new Error("Supplier name is required.");const existing=suppliers.find((s)=>s.supplier_name.toLowerCase()===n.toLowerCase());if(existing)return existing.id;const{data,error}=await supabase.from("suppliers").insert({shop_id:profile.shop_id,supplier_name:n,active:true}).select("id,supplier_name,active").single();if(error)throw error;setSuppliers((s)=>[...s,data]);return data.id;}
  async function receiveStock({supplierName,invoiceNumber,invoiceDate,items,notes=""}){try{if(!items?.length)return{ok:false,message:"Add at least one product."};const supplierId=await ensureSupplier(supplierName);const payload=items.map((i)=>({product_id:i.productId,case_count:Number(i.caseCount||0),units_per_case:Number(i.unitsPerCase||1),loose_bottles:Number(i.looseBottles||0),quantity:Number(i.quantity),purchase_price:Number(i.purchasePrice)}));const{data,error}=await supabase.rpc("receive_purchase",{p_supplier_id:supplierId,p_invoice_number:String(invoiceNumber||"").trim(),p_invoice_date:invoiceDate||new Date().toISOString().slice(0,10),p_items:payload,p_notes:notes||null});if(error)throw error;await refreshAll();return{ok:true,purchaseId:data,message:"Stock received successfully."}}catch(e){return{ok:false,message:e.message||String(e)}}}
  async function adjustStock({productId,adjustmentType,quantityChange,reason,notes=""}){try{const{data,error}=await supabase.rpc("adjust_stock",{p_product_id:productId,p_adjustment_type:adjustmentType,p_quantity_change:Number(quantityChange),p_reason:String(reason||"").trim(),p_notes:notes||null});if(error)throw error;await refreshAll();return{ok:true,quantity:data,message:"Stock adjusted."}}catch(e){return{ok:false,message:e.message||String(e)}}}
  function createBackup(){return{meta:{app:"WineShopPOS",mode:"SUPABASE_CLOUD",exportedAt:new Date().toISOString()},data:{products,inventory,sales,purchases}}}
  const lowStockProducts=useMemo(()=>products.filter((p)=>p.active&&getStock(p.id)<=p.minimumStock),[products,inventory]);

  return <ShopContext.Provider value={{products,inventory,sales,purchases,categories,suppliers,loadingData,dataError,lowStockProducts,getStock,refreshAll,addProduct,updateProduct,deactivateProduct,activateProduct,completeSale,receiveStock,adjustStock,createBackup,syncOfflineSales}}>{children}</ShopContext.Provider>;
}

export function useShop(){const c=useContext(ShopContext);if(!c)throw new Error("useShop must be used inside ShopProvider");return c;}
