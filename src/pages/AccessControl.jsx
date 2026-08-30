import { Link } from "react-router-dom";
import { Check, Eye, LockKeyhole, ShieldCheck, X } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { ROLE_ACCESS_ROWS, ROLE_SUMMARY } from "../config/accessMatrix";

function AccessCell({ value }) {
  const denied = value === "NO";
  const Icon = denied ? X : value === "VIEW IN POS" || value === "VIEW/EXPORT" ? Eye : value.includes("ADMIN") ? LockKeyhole : Check;
  return <span className={denied ? "access-chip denied" : "access-chip allowed"}><Icon size={13}/>{value}</span>;
}

export default function AccessControl() {
  return <div>
    <PageHeader title="Role Access Control" subtitle="Authoritative role boundaries for Cashier, Manager and Shop Admin. Change a user's role from Users; ADMIN itself remains platform-controlled."/>
    <div className="role-summary-grid">
      {Object.entries(ROLE_SUMMARY).map(([role, text]) => <section className="panel role-summary-card" key={role}><div className={`role-orb ${role.toLowerCase()}`}><ShieldCheck size={20}/></div><div><h3>{role}</h3><p>{text}</p></div></section>)}
    </div>
    <section className="panel" style={{marginTop:16}}>
      <div className="section-row"><div><h3>Access Matrix</h3><p className="muted-text">Roles are security boundaries, not just hidden menu items. Backend RLS/RPC checks remain authoritative.</p></div><Link className="primary-button button-link" to="/admin/users">Manage Users</Link></div>
      <div className="data-table-wrapper access-matrix-wrap"><table className="data-table access-matrix"><thead><tr><th>Capability</th><th>Cashier</th><th>Manager</th><th>Shop Admin</th><th>Control</th></tr></thead><tbody>{ROLE_ACCESS_ROWS.map((row)=><tr key={row.capability}><td><strong>{row.capability}</strong></td><td><AccessCell value={row.cashier}/></td><td><AccessCell value={row.manager}/></td><td><AccessCell value={row.admin}/></td><td className="muted-text">{row.note}</td></tr>)}</tbody></table></div>
    </section>
    <section className="panel access-safety-note" style={{marginTop:16}}><LockKeyhole size={20}/><div><strong>Security rule</strong><p>A Shop Admin can move a non-admin staff account between CASHIER and MANAGER, or disable it. A Shop Admin cannot create/promote another ADMIN, change the platform-owned subscription kill switch, or bypass Supabase security.</p></div></section>
  </div>;
}
