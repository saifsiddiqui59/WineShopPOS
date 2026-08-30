import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import LoadingState from "../components/ui/LoadingState";

const emptyForm = {
  shopName: "", shopSlug: "", storeAddress: "", storePhone: "", taxRegistrationNumber: "",
  currencyCode: "INR", currencySymbol: "₹", invoicePrefix: "INV", purchasePrefix: "PUR",
  taxEnabled: false, taxPercentage: 0, printerPaperMm: 80, receiptFooter: "",
};

export default function Settings() {
  const { refreshAccess } = useAuth();
  const { products, sales, purchases, createBackup, refreshAll } = useShop();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true); setMessage("");
    const { data, error } = await supabase.rpc("get_shop_configuration");
    if (error) setMessage("Unable to load shop settings.");
    else if (data?.[0]) {
      const r = data[0];
      setForm({
        shopName: r.shop_name || "", shopSlug: r.shop_slug || "", storeAddress: r.store_address || "",
        storePhone: r.store_phone || "", taxRegistrationNumber: r.tax_registration_number || "",
        currencyCode: r.currency_code || "INR", currencySymbol: r.currency_symbol || "₹",
        invoicePrefix: r.invoice_prefix || "INV", purchasePrefix: r.purchase_prefix || "PUR",
        taxEnabled: Boolean(r.tax_enabled), taxPercentage: Number(r.tax_percentage || 0),
        printerPaperMm: Number(r.printer_paper_mm || 80), receiptFooter: r.receipt_footer || "",
      });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.rpc("update_shop_configuration", {
      p_shop_name: form.shopName,
      p_store_address: form.storeAddress || null,
      p_store_phone: form.storePhone || null,
      p_tax_registration_number: form.taxRegistrationNumber || null,
      p_currency_code: form.currencyCode,
      p_currency_symbol: form.currencySymbol,
      p_invoice_prefix: form.invoicePrefix,
      p_purchase_prefix: form.purchasePrefix,
      p_tax_enabled: form.taxEnabled,
      p_tax_percentage: Number(form.taxPercentage || 0),
      p_printer_paper_mm: Number(form.printerPaperMm),
      p_receipt_footer: form.receiptFooter || null,
    });
    if (error) setMessage("Unable to save shop settings. Check the values and try again.");
    else {
      setMessage("Shop settings saved successfully.");
      await Promise.all([refreshAccess(), refreshAll()]);
      await load();
    }
    setBusy(false);
  }

  function exportSnapshot() {
    const backup = createBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wineshoppos-cloud-snapshot-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <LoadingState label="Loading shop settings..."/>;

  return <div>
    <PageHeader title="Shop Settings" subtitle="Edit the operational identity, invoice numbering, receipt and printer defaults for the current shop."/>
    {message ? <div className="purchase-message">{message}</div> : null}
    <form onSubmit={save}>
      <div className="settings-grid">
        <section className="panel settings-section">
          <div className="settings-section-heading"><div><h3>Shop Identity</h3><p>Customer-facing details used across receipts and operational screens.</p></div></div>
          <div className="settings-fields">
            <label>Shop Name<input required value={form.shopName} onChange={(e)=>setForm({...form,shopName:e.target.value})}/></label>
            <label>Shop Slug<input value={form.shopSlug} disabled/><small>Stable system identifier. It is intentionally read-only.</small></label>
            <label>Phone<input value={form.storePhone} onChange={(e)=>setForm({...form,storePhone:e.target.value})} placeholder="+91 ..."/></label>
            <label>Tax / Registration Number<input value={form.taxRegistrationNumber} onChange={(e)=>setForm({...form,taxRegistrationNumber:e.target.value})}/></label>
            <label className="span-two">Address<textarea value={form.storeAddress} onChange={(e)=>setForm({...form,storeAddress:e.target.value})}/></label>
          </div>
        </section>

        <section className="panel settings-section">
          <div className="settings-section-heading"><div><h3>Billing & Numbering</h3><p>Defaults used by invoices, purchase documents and receipts.</p></div></div>
          <div className="settings-fields">
            <label>Currency Code<input required maxLength="3" value={form.currencyCode} onChange={(e)=>setForm({...form,currencyCode:e.target.value.toUpperCase()})}/></label>
            <label>Currency Symbol<input required maxLength="4" value={form.currencySymbol} onChange={(e)=>setForm({...form,currencySymbol:e.target.value})}/></label>
            <label>Invoice Prefix<input required maxLength="12" value={form.invoicePrefix} onChange={(e)=>setForm({...form,invoicePrefix:e.target.value.toUpperCase()})}/></label>
            <label>Purchase Prefix<input required maxLength="12" value={form.purchasePrefix} onChange={(e)=>setForm({...form,purchasePrefix:e.target.value.toUpperCase()})}/></label>
            <label>Receipt Paper<select value={form.printerPaperMm} onChange={(e)=>setForm({...form,printerPaperMm:Number(e.target.value)})}><option value={80}>80 mm</option><option value={58}>58 mm</option></select></label>
            <label className="span-two">Receipt Footer<textarea value={form.receiptFooter} onChange={(e)=>setForm({...form,receiptFooter:e.target.value})} placeholder="Thank you for your purchase"/></label>
          </div>
        </section>
      </div>

      <section className="panel settings-section" style={{marginTop:16}}>
        <div className="settings-section-heading"><div><h3>Tax Configuration</h3><p>Enable only when the shop's verified accounting/legal configuration requires it.</p></div></div>
        <div className="settings-inline-row">
          <label className="toggle-field"><input type="checkbox" checked={form.taxEnabled} onChange={(e)=>setForm({...form,taxEnabled:e.target.checked})}/><span>Enable configured tax percentage</span></label>
          <label>Tax Percentage<input type="number" min="0" step="0.01" disabled={!form.taxEnabled} value={form.taxPercentage} onChange={(e)=>setForm({...form,taxPercentage:e.target.value})}/></label>
        </div>
        <p className="muted-text">WineShopPOS does not invent state liquor/excise rules. Configure tax only from verified requirements.</p>
      </section>

      <div className="settings-action-bar">
        <div><strong>{products.length}</strong> products · <strong>{sales.length}</strong> sales loaded · <strong>{purchases.length}</strong> purchases loaded</div>
        <div className="button-row"><button type="button" className="secondary-button" onClick={refreshAll}>Refresh Cloud Data</button><button type="button" className="secondary-button" onClick={exportSnapshot}>Export JSON Snapshot</button><button className="primary-button" disabled={busy}>{busy ? "Saving..." : "Save Shop Settings"}</button></div>
      </div>
    </form>
  </div>;
}
