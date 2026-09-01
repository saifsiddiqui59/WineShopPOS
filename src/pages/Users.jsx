import SortableTable from "../components/ui/SortableTable";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

export default function Users() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "CASHIER" });
  const isAdmin = profile?.role === "ADMIN";

  async function callFunction(body) {
    const { data, error } = await supabase.functions.invoke("manage-shop-users", { body });
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.message || "Operation failed");
    return data;
  }

  async function loadUsers() {
    if (!isAdmin) return;
    try { const data = await callFunction({ action: "list" }); setUsers(data.users || []); }
    catch (error) { setMessage(error.message || "Unable to load users."); }
  }

  useEffect(() => { loadUsers(); }, [isAdmin]);

  async function createUser(event) {
    event.preventDefault(); setMessage("");
    try {
      await callFunction({ action: "create", fullName: form.fullName, email: form.email, password: form.password, role: form.role });
      setForm({ fullName: "", email: "", password: "", role: "CASHIER" });
      setMessage("User created successfully."); await loadUsers();
    } catch (error) { setMessage(error.message || "Unable to create user."); }
  }

  async function setActive(userId, active) {
    setBusyId(userId); setMessage("");
    try { await callFunction({ action: "set_active", userId, active }); setMessage(active ? "User enabled." : "User disabled."); await loadUsers(); }
    catch (error) { setMessage(error.message || "Unable to update user status."); }
    setBusyId("");
  }

  async function setRole(userId, role) {
    setBusyId(userId); setMessage("");
    try { await callFunction({ action: "set_role", userId, role }); setMessage(`Role changed to ${role}.`); await loadUsers(); }
    catch (error) { setMessage(error.message || "Unable to change user role."); }
    setBusyId("");
  }

  if (!isAdmin) return <section className="panel"><h2>Users</h2><p>Only the Shop Admin can manage users and roles.</p></section>;

  return <div>
    <PageHeader title="Users & Roles" subtitle="Create staff, change Cashier/Manager responsibilities and disable access without weakening backend security." actions={<Link className="secondary-button button-link" to="/admin/access">View Access Matrix</Link>}/>
    {message ? <div className="purchase-message">{message}</div> : null}
    <div className="settings-grid">
      <form className="panel settings-section" onSubmit={createUser}>
        <div className="settings-section-heading"><div><h3>Create Shop User</h3><p>Create operational staff only. Shop Admin creation remains platform-controlled.</p></div></div>
        <div className="settings-fields">
          <label>Full Name<input required value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})}/></label>
          <label>Email<input type="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></label>
          <label>Temporary Password<input type="password" required minLength="8" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/></label>
          <label>Role<select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}><option value="CASHIER">Cashier</option><option value="MANAGER">Manager</option></select></label>
        </div>
        <button className="primary-button">Create User</button>
      </form>
      <section className="panel settings-section">
        <div className="settings-section-heading"><div><h3>Role Principle</h3><p>Give each user the least access needed for their job.</p></div></div>
        <div className="role-rule-list">
          <div><StatusBadge status="CASHIER"/><span>Sell, scan, own shift, permitted sales/returns and offline queue.</span></div>
          <div><StatusBadge status="MANAGER"/><span>Operational control: products, purchasing, inventory, approvals, expenses and reports.</span></div>
          <div><StatusBadge status="ADMIN"/><span>Owner/Admin functions: Owner Center, users, settings, backup and audit.</span></div>
        </div>
        <Link to="/admin/access">Open the complete role access matrix →</Link>
      </section>
    </div>

    <section className="panel" style={{marginTop:18}}>
      <div className="section-row"><div><h3>Shop Users</h3><p className="muted-text">Role changes take effect after the user's access state refreshes/signs in again.</p></div></div>
      {users.length === 0 ? <EmptyState title="No shop users" message="Create the first Manager or Cashier account above."/> : <div className="data-table-wrapper"><SortableTable className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Access Management</th></tr></thead><tbody>{users.map((item)=><tr key={item.id}><td><strong>{item.full_name}</strong></td><td>{item.email || "-"}</td><td>{item.role === "ADMIN" ? <StatusBadge status="ADMIN"/> : <select className="role-select" value={item.role} disabled={busyId===item.id} onChange={(e)=>setRole(item.id,e.target.value)}><option value="CASHIER">Cashier</option><option value="MANAGER">Manager</option></select>}</td><td><StatusBadge status={item.active ? "ACTIVE" : "INACTIVE"}/></td><td>{item.role === "ADMIN" ? <span className="muted-text">Platform controlled</span> : <button className="secondary-button" disabled={busyId===item.id} onClick={()=>setActive(item.id,!item.active)}>{item.active ? "Disable Access" : "Enable Access"}</button>}</td></tr>)}</tbody></SortableTable></div>}
    </section>
  </div>;
}
