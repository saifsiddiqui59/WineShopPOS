import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import SupplierEditor from "../components/SupplierEditor";

export default function Suppliers() {
  const { refreshAll } = useShop();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState({ open: false, supplier: null });

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("suppliers")
      .select("id,supplier_name,contact_person,mobile,email,gst_number,address,active,created_at,updated_at")
      .order("active", { ascending: false })
      .order("supplier_name");
    if (error) setMessage("Unable to load suppliers.");
    else { setRows(data || []); setMessage(""); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => [row.supplier_name, row.contact_person, row.mobile, row.email, row.gst_number]
      .some((value) => String(value || "").toLowerCase().includes(term)));
  }, [rows, query]);

  async function toggleActive(row) {
    const { error } = await supabase.from("suppliers").update({ active: !row.active }).eq("id", row.id);
    if (error) setMessage("Unable to change supplier status.");
    else {
      setMessage(row.active ? "Supplier deactivated. Existing history is preserved." : "Supplier reactivated.");
      await Promise.all([load(), refreshAll()]);
    }
  }

  async function afterSave() {
    setMessage("Supplier saved.");
    await Promise.all([load(), refreshAll()]);
  }

  return <div>
    <PageHeader title="Supplier Master" subtitle="Create, edit and deactivate suppliers without leaving the procurement workflow." />
    {message ? <div className="purchase-message">{message}</div> : null}

    <section className="panel">
      <div className="filter-row">
        <input className="search-input" placeholder="Search supplier, mobile, email or GST..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="primary-button" onClick={() => setEditor({ open: true, supplier: null })}>+ New Supplier</button>
      </div>
    </section>

    <section className="panel" style={{ marginTop: 16 }}>
      {loading ? <p className="muted-text">Loading suppliers...</p> : filtered.length === 0 ?
        <EmptyState title="No suppliers found" message="Create your first supplier or clear the current search." /> :
        <div className="data-table-wrapper"><table className="data-table sticky">
          <thead><tr><th>Supplier</th><th>Contact</th><th>Mobile</th><th>Email</th><th>GST / Tax</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map((row) => <tr key={row.id}>
            <td><strong>{row.supplier_name}</strong><div className="muted-text table-subtext">{row.address || "No address"}</div></td>
            <td>{row.contact_person || "-"}</td>
            <td>{row.mobile || "-"}</td>
            <td>{row.email || "-"}</td>
            <td>{row.gst_number || "-"}</td>
            <td><StatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} /></td>
            <td><div className="button-row compact">
              <button className="secondary-button" onClick={() => setEditor({ open: true, supplier: row })}>Edit</button>
              <button className="secondary-button" onClick={() => toggleActive(row)}>{row.active ? "Deactivate" : "Reactivate"}</button>
            </div></td>
          </tr>)}</tbody>
        </table></div>}
    </section>

    <SupplierEditor open={editor.open} supplier={editor.supplier} onClose={() => setEditor({ open: false, supplier: null })} onSaved={afterSave} />
  </div>;
}

