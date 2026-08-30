import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const EMPTY = {
  supplier_name: "",
  contact_person: "",
  mobile: "",
  email: "",
  gst_number: "",
  address: "",
  active: true,
};

export default function SupplierEditor({ open, supplier = null, defaults = null, onClose, onSaved }) {
  const { profile } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setMessage("");
      setForm({ ...EMPTY, ...(defaults || {}), ...(supplier || {}) });
      if (!supplier?.id) return;

      const { data, error } = await supabase
        .from("suppliers")
        .select("id,supplier_name,contact_person,mobile,email,gst_number,address,active")
        .eq("id", supplier.id)
        .single();

      if (cancelled) return;
      if (error) setMessage("Unable to load supplier details.");
      else setForm({ ...EMPTY, ...data });
    }

    load();
    return () => { cancelled = true; };
  }, [open, supplier, defaults]);

  if (!open) return null;

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event) {
    event.preventDefault();
    const name = String(form.supplier_name || "").trim();
    if (!name) {
      setMessage("Supplier name is required.");
      return;
    }
    if (!profile?.shop_id) {
      setMessage("Active shop is not available.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const duplicateQuery = await supabase
        .from("suppliers")
        .select("id,supplier_name")
        .eq("shop_id", profile.shop_id)
        .limit(500);

      if (duplicateQuery.error) throw duplicateQuery.error;
      const duplicate = (duplicateQuery.data || []).find((row) =>
        row.id !== supplier?.id && String(row.supplier_name || "").trim().toLowerCase() === name.toLowerCase()
      );
      if (duplicate) {
        setMessage(`A supplier named “${duplicate.supplier_name}” already exists.`);
        return;
      }

      const payload = {
        supplier_name: name,
        contact_person: String(form.contact_person || "").trim() || null,
        mobile: String(form.mobile || "").trim() || null,
        email: String(form.email || "").trim() || null,
        gst_number: String(form.gst_number || "").trim() || null,
        address: String(form.address || "").trim() || null,
        active: form.active !== false,
      };

      let result;
      if (supplier?.id) {
        result = await supabase
          .from("suppliers")
          .update(payload)
          .eq("id", supplier.id)
          .select("id,supplier_name,contact_person,mobile,email,gst_number,address,active")
          .single();
      } else {
        result = await supabase
          .from("suppliers")
          .insert({ shop_id: profile.shop_id, ...payload })
          .select("id,supplier_name,contact_person,mobile,email,gst_number,address,active")
          .single();
      }

      if (result.error) throw result.error;
      await onSaved?.(result.data);
      onClose?.();
    } catch (error) {
      console.error(error);
      setMessage("Unable to save supplier. Check the details and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose?.(); }}>
    <form className="modal-card supplier-editor" onSubmit={save} role="dialog" aria-modal="true" aria-label={supplier?.id ? "Edit supplier" : "Create supplier"}>
      <div className="modal-header">
        <div>
          <h3>{supplier?.id ? "Edit Supplier" : "New Supplier"}</h3>
          <p className="muted-text">Supplier details are available only to authorized shop management users.</p>
        </div>
        <button type="button" className="icon-button" aria-label="Close" onClick={onClose} disabled={busy}>×</button>
      </div>

      {message ? <div className="purchase-message error">{message}</div> : null}

      <div className="form-grid">
        <label>Supplier Name *
          <input autoFocus required value={form.supplier_name || ""} onChange={(e) => setField("supplier_name", e.target.value)} />
        </label>
        <label>Contact Person
          <input value={form.contact_person || ""} onChange={(e) => setField("contact_person", e.target.value)} />
        </label>
        <label>Mobile
          <input inputMode="tel" value={form.mobile || ""} onChange={(e) => setField("mobile", e.target.value)} />
        </label>
        <label>Email
          <input type="email" value={form.email || ""} onChange={(e) => setField("email", e.target.value)} />
        </label>
        <label>GST / Tax Number
          <input value={form.gst_number || ""} onChange={(e) => setField("gst_number", e.target.value)} />
        </label>
        <label className="span-two">Address
          <textarea rows="3" value={form.address || ""} onChange={(e) => setField("address", e.target.value)} />
        </label>
      </div>

      {supplier?.id ? <label className="checkbox-row">
        <input type="checkbox" checked={form.active !== false} onChange={(e) => setField("active", e.target.checked)} /> Active supplier
      </label> : null}

      <div className="button-row end">
        <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="primary-button" disabled={busy}>{busy ? "Saving..." : supplier?.id ? "Save Supplier" : "Create Supplier"}</button>
      </div>
    </form>
  </div>;
}

