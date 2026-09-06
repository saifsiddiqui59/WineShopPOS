# WineShopPOS V2 — Role / Security Inventory

```text
src/aiOwnerAssistant.css:24:.ai-turn-role{font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;opacity:.72;margin-bottom:5px}
src/App.jsx:73:        <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}>
src/App.jsx:97:        <Route path="operations" element={module("Operations", "Day-to-day shifts and reliability, with management controls shown only to authorized roles.", MODULE_TABS.operations)}>
src/App.jsx:101:          <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}>
src/App.jsx:108:        <Route element={<RequireRole roles={["ADMIN"]}/>}>
src/App.jsx:119:        <Route element={<RequireRole roles={["ADMIN","MANAGER"]}/>}>
src/App.jsx:126:        <Route element={<RequireRole roles={["ADMIN"]}/>}>
src/assets/react.svg:1:<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
src/components/charts/BusinessCharts.jsx:36:    <div className="line-chart" role="img" aria-label={`${title}. Latest value ${formatValue(last[valueKey])}.`}>
src/components/charts/BusinessCharts.jsx:58:      <div className="donut-chart" style={{ background: `conic-gradient(${stops.join(",")})` }} role="img" aria-label={`${title}. ${rows.map((row)=>`${row[labelKey]} ${formatValue(row[valueKey])}`).join(", ")}.`}><div className="donut-hole"><span>{centerLabel}</span><strong>{formatValue(total)}</strong></div></div>
src/components/charts/BusinessCharts.jsx:70:    <div className="horizontal-bars" role="img" aria-label={title}>{rows.map((row,index)=><div className="horizontal-bar-row" key={`${row[labelKey]}-${index}`}><div className="horizontal-bar-meta"><span title={row[labelKey]}>{row[labelKey]}</span><strong>{formatValue(row[valueKey])}</strong></div><div className="horizontal-bar-track"><div className="horizontal-bar-fill" style={{ width: `${Math.max(3, safeNumber(row[valueKey])/max*100)}%`, background: PALETTE[index % PALETTE.length] }}/></div></div>)}</div>
src/components/charts/BusinessCharts.jsx:80:    <div className="column-chart" role="img" aria-label={title}>{rows.map((row,index)=>{
src/components/HomeRedirect.jsx:5:  return <Navigate to={profile?.role === "CASHIER" ? "/pos" : "/owner"} replace/>;
src/components/Layout.jsx:49:        {MAIN_MODULES.filter((item) => item.roles.includes(profile?.role)).map((item) => {
src/components/ModuleLayout.jsx:7:  const visible = tabs.filter((tab) => tab.roles?.includes(profile?.role));
src/components/RequireRole.jsx:4:export default function RequireRole({ roles }) {
src/components/RequireRole.jsx:9:  if (!profile || !roles.includes(profile.role)) {
src/components/ShopSelector.jsx:15:  }, [profile?.shop_id]);
src/components/ShopSelector.jsx:18:    if (!shopId || shopId === profile?.shop_id) return;
src/components/ShopSelector.jsx:20:    const { error } = await supabase.rpc("switch_shop", { p_shop_id: shopId });
src/components/ShopSelector.jsx:29:  if (profile?.role === "CASHIER" || shops.length <= 1) return <div className="shop-context-pill"><Store size={15}/><span>{profile?.shop_name || "Shop"}</span></div>;
src/components/ShopSelector.jsx:30:  return <label className="shop-selector"><Store size={15}/><span className="sr-only">Current shop</span><select value={profile?.shop_id || ""} disabled={busy} onChange={(e) => change(e.target.value)}>{shops.map((shop) => <option key={shop.shop_id} value={shop.shop_id}>{shop.shop_name}</option>)}</select></label>;
src/components/SupplierEditor.jsx:58:    if (!profile?.shop_id) {
src/components/SupplierEditor.jsx:69:        .eq("shop_id", profile.shop_id)
src/components/SupplierEditor.jsx:102:          .insert({ shop_id: profile.shop_id, ...payload })
src/components/SupplierEditor.jsx:118:  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose?.(); }}>
src/components/SupplierEditor.jsx:119:    <form className="modal-card supplier-editor" onSubmit={save} role="dialog" aria-modal="true" aria-label={supplier?.id ? "Edit supplier" : "Create supplier"}>
src/components/ui/ConfirmationDialog.jsx:1:export default function ConfirmationDialog({open,title,message,confirmLabel="Confirm",onConfirm,onCancel,busy=false}){if(!open)return null;return <div className="dialog-backdrop" role="presentation" onMouseDown={onCancel}><div className="dialog-card" role="dialog" aria-modal="true" aria-label={title} onMouseDown={e=>e.stopPropagation()}><h3>{title}</h3><p>{message}</p><div className="button-row"><button className="secondary-button" onClick={onCancel} disabled={busy}>Cancel</button><button className="primary-button" onClick={onConfirm} disabled={busy}>{busy?"Working...":confirmLabel}</button></div></div></div>}
src/components/UserMenu.jsx:25:      <UserAvatar profile={profile}/><div className="user-menu-trigger-text"><strong>{profile?.full_name || "User"}</strong><span>{profile?.role || ""}</span></div>
src/components/UserMenu.jsx:28:      <div className="user-menu-summary"><UserAvatar profile={profile} size="lg"/><div><strong>{profile?.full_name || "User"}</strong><span>{profile?.email || user?.email || ""}</span><div className="summary-badges"><StatusBadge status={profile?.role}/></div></div></div>
src/config/accessMatrix.js:14:  { capability: "Owner Center / profit / loss", cashier: "NO", manager: "NO", admin: "ADMIN ONLY", note: "Protected in navigation, routes and backend RPCs." },
src/config/accessMatrix.js:15:  { capability: "Users & role changes", cashier: "NO", manager: "NO", admin: "MANAGE", note: "Admin can set staff as Cashier or Manager only." },
src/config/accessMatrix.js:21:  CASHIER: "Fast selling role: bill, scan, own shift, permitted sales/returns and offline queue. No master-data or financial administration.",
src/config/accessMatrix.js:22:  MANAGER: "Operational management role: products, purchases, inventory, stock counts/transfers, expenses, approvals and reports. No Owner Center or user/shop administration.",
src/config/accessMatrix.js:23:  ADMIN: "Shop owner/admin role: all shop-authorized functionality including Owner Center, users, role changes, shop settings, backup and audit.",
src/config/navigation.js:13:  { path: "/pos", label: "POS & Billing", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "CASHIER"] },
src/config/navigation.js:14:  { path: "/products", label: "Products", icon: Package, roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:15:  { path: "/purchasing", label: "Purchases & Suppliers", icon: Store, roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:16:  { path: "/inventory", label: "Inventory", icon: Boxes, roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:17:  { path: "/operations", label: "Operations", icon: ClipboardList, roles: ["ADMIN", "MANAGER", "CASHIER"] },
src/config/navigation.js:18:  { path: "/owner", label: "Owner Center", icon: Building2, roles: ["ADMIN"] },
src/config/navigation.js:19:  { path: "/reports", label: "Reports & Compliance", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:20:  { path: "/admin", label: "Settings & Admin", icon: Settings, roles: ["ADMIN"] },
src/config/navigation.js:25:    { path: "/pos", label: "Billing", roles: ["ADMIN", "MANAGER", "CASHIER"] },
src/config/navigation.js:26:    { path: "/pos/sales", label: "Sales", roles: ["ADMIN", "MANAGER", "CASHIER"] },
src/config/navigation.js:27:    { path: "/pos/returns", label: "Returns & Voids", roles: ["ADMIN", "MANAGER", "CASHIER"] },
src/config/navigation.js:28:    { path: "/pos/shifts", label: "Shift", roles: ["ADMIN", "MANAGER", "CASHIER"] },
src/config/navigation.js:29:    { path: "/pos/scanner", label: "Scanner", roles: ["ADMIN", "MANAGER", "CASHIER"] },
src/config/navigation.js:32:    { path: "/products", label: "Product Master", roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:33:    { path: "/products/labels", label: "Barcode Labels", roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:36:    { path: "/purchasing/receive", label: "Receive Stock", roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:37:    { path: "/purchasing/suppliers", label: "Suppliers", roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:38:    { path: "/purchasing/procurement", label: "Procurement", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
src/config/navigation.js:39:    { path: "/purchasing/intelligence", label: "Purchase Intelligence", roles: ["ADMIN", "MANAGER"], tier: "PRO" },
src/config/navigation.js:42:    { path: "/inventory", label: "Overview", roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:43:    { path: "/inventory/count", label: "Stock Count", roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:44:    { path: "/inventory/transfers", label: "Transfers", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
src/config/navigation.js:45:    { path: "/inventory/intelligence", label: "Intelligence", roles: ["ADMIN", "MANAGER"], tier: "PRO" },
src/config/navigation.js:48:    { path: "/operations/shifts", label: "Shift & Day Close", roles: ["ADMIN", "MANAGER", "CASHIER"] },
src/config/navigation.js:49:    { path: "/operations/expenses", label: "Expenses", roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:50:    { path: "/operations/approvals", label: "Approvals", roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:51:    { path: "/operations/customers", label: "Customer & Credit", roles: ["ADMIN", "MANAGER"], tier: "PLUS" },
src/config/navigation.js:52:    { path: "/operations/offline", label: "Offline Queue", roles: ["ADMIN", "MANAGER", "CASHIER"] },
src/config/navigation.js:55:    { path: "/owner", label: "Overview", roles: ["ADMIN"], tier: "PRO" },
src/config/navigation.js:56:    { path: "/owner/profit", label: "Profit Intelligence", roles: ["ADMIN"], tier: "PRO" },
src/config/navigation.js:57:    { path: "/owner/exceptions", label: "Loss & Exceptions", roles: ["ADMIN"], tier: "PRO" },
src/config/navigation.js:58:    { path: "/owner/ask", label: "Ask WineShopPOS", roles: ["ADMIN"], tier: "PRO" },
src/config/navigation.js:59:    { path: "/owner/recommendations", label: "Recommendations", roles: ["ADMIN"], tier: "PLUS" },
src/config/navigation.js:60:    { path: "/owner/share", label: "WhatsApp Summary", roles: ["ADMIN"], tier: "PLUS" },
src/config/navigation.js:63:    { path: "/reports", label: "Reports & Exports", roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:64:    { path: "/reports/compliance", label: "Liquor Compliance", roles: ["ADMIN", "MANAGER"] },
src/config/navigation.js:67:    { path: "/admin/users", label: "Users", roles: ["ADMIN"] },
src/config/navigation.js:68:    { path: "/admin/access", label: "Access Control", roles: ["ADMIN"] },
src/config/navigation.js:69:    { path: "/admin/hardware", label: "Hardware", roles: ["ADMIN"] },
src/config/navigation.js:70:    { path: "/admin/backup", label: "Backup & Recovery", roles: ["ADMIN"] },
src/config/navigation.js:71:    { path: "/admin/audit", label: "Audit Log", roles: ["ADMIN"] },
src/config/navigation.js:72:    { path: "/admin/settings", label: "Shop Settings", roles: ["ADMIN"] },
src/context/ShopContext.jsx:74:        profile?.role === "CASHIER" ? Promise.resolve({ data: [], error: null }) : supabase.from("suppliers").select("id,supplier_name,active").order("supplier_name"),
src/context/ShopContext.jsx:83:      if (profile?.role === "CASHIER") salesQuery = salesQuery.eq("cashier_id", profile.user_id);
src/context/ShopContext.jsx:86:        profile?.role === "CASHIER" ? Promise.resolve({ data: [], error: null }) : supabase.from("purchases").select(`id,purchase_number,supplier_id,supplier_name_snapshot,invoice_number,invoice_date,subtotal,tax,total,status,notes,created_at,purchase_items(id,product_id,quantity,purchase_unit,case_count,units_per_case,loose_bottles,purchase_price,line_total)`).order("created_at", { ascending: false }).limit(1000),
src/context/ShopContext.jsx:101:  }, [canUseShop, profile?.role, profile?.user_id]);
src/context/ShopContext.jsx:111:    const { data, error } = await supabase.from("categories").insert({ shop_id: profile.shop_id, name: categoryName, active: true }).select("id,name,active").single();
src/context/ShopContext.jsx:170:  async function ensureSupplier(name){const n=String(name||"").trim();if(!n)throw new Error("Supplier name is required.");const existing=suppliers.find((s)=>s.supplier_name.toLowerCase()===n.toLowerCase());if(existing)return existing.id;const{data,error}=await supabase.from("suppliers").insert({shop_id:profile.shop_id,supplier_name:n,active:true}).select("id,supplier_name,active").single();if(error)throw error;setSuppliers((s)=>[...s,data]);return data.id;}
src/lib/aiClient.js:21:      selected_shop_id: selectedShopId,
src/masterConsolidation.css:333:/* Settings / role administration */
src/masterConsolidation.css:339:.role-summary-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }.role-summary-card { display:flex; gap:12px; }.role-summary-card h3,.role-summary-card p { margin:0; }.role-summary-card p { margin-top:5px; font-size:12px; line-height:1.5; }.role-orb { width:42px; height:42px; border-radius:11px; display:grid; place-items:center; flex:0 0 auto; }.role-orb.cashier { background:#eaf5ff; color:#118DFF; }.role-orb.manager { background:#f0edff; color:#744EC2; }.role-orb.admin { background:#fff1e9; color:#E66C37; }
src/masterConsolidation.css:342:.access-matrix th:nth-child(1){min-width:180px}.access-matrix th:nth-child(5){min-width:280px}.access-safety-note { display:flex; gap:12px; align-items:flex-start; }.access-safety-note p { margin:4px 0 0; }.role-rule-list { display:grid; gap:11px; margin:14px 0; }.role-rule-list>div { display:grid; grid-template-columns:90px 1fr; gap:10px; align-items:start; }.role-rule-list span:last-child { color:var(--ws-muted); font-size:12px; line-height:1.5; }.role-select { min-width:120px; }
src/masterConsolidation.css:349:@media(max-width:1150px){.dashboard-chart-grid.primary,.dashboard-chart-grid{grid-template-columns:1fr}.role-summary-grid{grid-template-columns:1fr}.settings-action-bar{position:static;flex-direction:column;align-items:flex-start}.settings-action-bar .button-row{width:100%;}}
src/masterConsolidation.css:350:@media(max-width:760px){.settings-fields{grid-template-columns:1fr}.settings-fields .span-two{grid-column:auto}.donut-layout{grid-template-columns:1fr}.dashboard-chart-grid{grid-template-columns:1fr}.theme-toggle span{display:none}.chart-card{min-height:280px}.role-rule-list>div{grid-template-columns:1fr}.column-chart{overflow-x:auto;justify-content:flex-start}.column-item{min-width:76px}.metric-card strong{font-size:22px!important}}
src/pages/AccessControl.jsx:8:  const Icon = denied ? X : value === "VIEW IN POS" || value === "VIEW/EXPORT" ? Eye : value.includes("ADMIN") ? LockKeyhole : Check;
src/pages/AccessControl.jsx:14:    <PageHeader title="Role Access Control" subtitle="Authoritative role boundaries for Cashier, Manager and Shop Admin. Change a user's role from Users; ADMIN itself remains platform-controlled."/>
src/pages/AccessControl.jsx:15:    <div className="role-summary-grid">
src/pages/AccessControl.jsx:16:      {Object.entries(ROLE_SUMMARY).map(([role, text]) => <section className="panel role-summary-card" key={role}><div className={`role-orb ${role.toLowerCase()}`}><ShieldCheck size={20}/></div><div><h3>{role}</h3><p>{text}</p></div></section>)}
src/pages/AccessControl.jsx:22:    <section className="panel access-safety-note" style={{marginTop:16}}><LockKeyhole size={20}/><div><strong>Security rule</strong><p>A Shop Admin can move a non-admin staff account between CASHIER and MANAGER, or disable it. A Shop Admin cannot create/promote another ADMIN, change the platform-owned subscription kill switch, or bypass Supabase security.</p></div></section>
src/pages/Account.jsx:48:    {tab === "profile" ? <div className="settings-grid"><section className="panel profile-summary-card"><UserAvatar profile={profile} size="xl"/><div><h3>{profile?.full_name}</h3><p>{profile?.email || user?.email}</p><StatusBadge status={profile?.role}/><p><strong>Shop:</strong> {profile?.shop_name}</p><p><strong>Organization:</strong> {profile?.organization_name || "-"}</p><p><strong>Account:</strong> {profile?.active ? "Active" : "Inactive"}</p><p><strong>Last login:</strong> {lastLogin}</p></div></section>
src/pages/Account.jsx:49:      <form className="panel" onSubmit={saveProfile}><h3>Editable profile</h3><div className="settings-fields"><label>Display Name<input required value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})}/></label><label>Phone<input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></label><label>Profile Image URL<input type="url" value={form.avatarUrl} onChange={(e)=>setForm({...form,avatarUrl:e.target.value})} placeholder="https://..."/></label></div><p className="muted-text">Email, role and shop security assignments cannot be changed here.</p><button className="primary-button" disabled={busy}>{busy?"Saving...":"Save Profile"}</button></form></div> : null}
src/pages/Approvals.jsx:8:async function load(){const[r,s,c,t,p]=await Promise.all([supabase.from("sale_return_requests").select("id,status,reason,total_refund,created_at").eq("status","PENDING").order("created_at"),supabase.from("cashier_shifts").select("id,status,cash_difference,opened_at,close_requested_at").eq("status","CLOSE_REQUESTED").order("close_requested_at"),supabase.from("stock_counts").select("id,count_number,status,submitted_at").eq("status","SUBMITTED").order("submitted_at"),supabase.from("stock_transfers").select("id,status,created_at,source_shop_id,destination_shop_id").eq("status","REQUESTED").order("created_at"),supabase.from("purchase_orders").select("id,po_number,status,subtotal,created_at").eq("status","APPROVAL_PENDING").order("created_at")]);if([r,s,c,t,p].some((x)=>x.error)){setMessage("Unable to load all approval queues.");return}setItems([...(r.data||[]).map((x)=>({type:"RETURN",id:x.id,title:`Return ${Number(x.total_refund||0).toFixed(2)}`,detail:x.reason,when:x.created_at,status:x.status})),...(s.data||[]).map((x)=>({type:"SHIFT",id:x.id,title:"Shift close",detail:`Cash difference ${x.cash_difference??"pending"}`,when:x.close_requested_at||x.opened_at,status:x.status})),...(c.data||[]).map((x)=>({type:"STOCK_COUNT",id:x.id,title:x.count_number,detail:"Physical stock count submitted",when:x.submitted_at,status:x.status})),...(t.data||[]).map((x)=>({type:"TRANSFER",id:x.id,title:"Incoming transfer",detail:`From ${String(x.source_shop_id).slice(0,8)}`,when:x.created_at,status:x.status})),...(p.data||[]).map((x)=>({type:"PURCHASE_ORDER",id:x.id,title:x.po_number,detail:`PO total ${x.subtotal}`,when:x.created_at,status:x.status}))].sort((a,b)=>new Date(b.when)-new Date(a.when)))}useEffect(()=>{load()},[]);
src/pages/OwnerAI.jsx:34:  const [selectedShopId, setSelectedShopId] = useState(profile?.shop_id || "");
src/pages/OwnerAI.jsx:53:        const adminShops = (data || []).filter((row) => row.role === "ADMIN");
src/pages/OwnerAI.jsx:55:        const preferred = adminShops.find((x) => x.shop_id === profile?.shop_id)?.shop_id || adminShops[0]?.shop_id || "";
src/pages/OwnerAI.jsx:61:  }, [profile?.shop_id]);
src/pages/OwnerAI.jsx:64:    () => memberships.find((x) => x.shop_id === selectedShopId) || null,
src/pages/OwnerAI.jsx:95:      role: turn.role,
src/pages/OwnerAI.jsx:99:    setTurns((current) => [...current, { role: "user", content: question }]);
src/pages/OwnerAI.jsx:110:        role: "assistant",
src/pages/OwnerAI.jsx:144:            {memberships.map((shop) => <option key={shop.shop_id} value={shop.shop_id}>{shop.shop_name}</option>)}
src/pages/OwnerAI.jsx:183:                  <div key={`${turn.role}-${index}`} className={`ai-turn ai-${turn.role}`}>
src/pages/OwnerAI.jsx:184:                    <div className="ai-turn-role">{turn.role === "assistant" ? "WineShopPOS" : "You"}</div>
src/pages/OwnerAI.jsx:186:                    {turn.role === "assistant" && turn.sources?.length ? (
src/pages/OwnerAI.jsx:202:                <div className="ai-turn-role">WineShopPOS</div>
src/pages/PrinterSettings.jsx:7:async function save(e){e.preventDefault();const{error}=await supabase.from("shop_settings").update(form).eq("shop_id",profile.shop_id);setMessage(error?error.message:"Receipt settings saved.")}
src/pages/Returns.jsx:14:  const manager=["ADMIN","MANAGER"].includes(profile?.role);
src/pages/Sales.jsx:20:          <p>{profile?.role === "CASHIER" ? "Your sales" : "Shop sales"} stored in Supabase</p>
src/pages/Shifts.jsx:7:export default function Shifts(){const{profile}=useAuth();const[shifts,setShifts]=useState([]);const[opening,setOpening]=useState(0);const[actual,setActual]=useState(0);const[message,setMessage]=useState("");const[offlineCounts,setOfflineCounts]=useState({total:0,pending:0,conflict:0});const manager=["ADMIN","MANAGER"].includes(profile?.role);
src/pages/Transfers.jsx:10:async function create(e){e.preventDefault();const{error}=await supabase.rpc("create_stock_transfer",{p_destination_shop_id:destination,p_items:[{product_id:productId,quantity:Number(qty)}],p_notes:null});setMessage(error?"Unable to request transfer.":"Transfer requested. Destination must approve before dispatch.");if(!error){setProductId("");setQty(1);load()}}
src/pages/Transfers.jsx:12:function actions(t){const incoming=t.destination_shop_id===profile?.shop_id;const outgoing=t.source_shop_id===profile?.shop_id;if(t.status==="REQUESTED"&&incoming)return <><button className="primary-button" onClick={()=>act("approve_stock_transfer",t.id,{},"Transfer approved")}>Approve</button><button className="secondary-button" onClick={()=>act("reject_stock_transfer",t.id,{p_note:"Rejected from consolidated transfer screen"},"Transfer rejected")}>Reject</button></>;if(t.status==="REQUESTED"&&outgoing)return <button className="secondary-button" onClick={()=>act("cancel_stock_transfer",t.id,{},"Transfer cancelled")}>Cancel</button>;if(t.status==="APPROVED"&&outgoing)return <button className="primary-button" onClick={()=>act("dispatch_stock_transfer",t.id,{},"Transfer dispatched; source stock deducted")}>Dispatch</button>;if(t.status==="DISPATCHED"&&outgoing)return <button className="secondary-button" onClick={()=>act("mark_stock_transfer_in_transit",t.id,{},"Transfer marked in transit")}>Mark In Transit</button>;if(["DISPATCHED","IN_TRANSIT"].includes(t.status)&&incoming)return <button className="primary-button" onClick={()=>act("receive_stock_transfer",t.id,{},"Transfer received; destination stock increased")}>Receive</button>;if(t.status==="RECEIVED"&&incoming)return <button className="primary-button" onClick={()=>act("complete_stock_transfer",t.id,{},"Transfer completed")}>Complete</button>;return <span className="muted-text">No action</span>}
src/pages/Transfers.jsx:13:return <div><PageHeader title="Advanced Stock Transfers" subtitle="Request → approve → dispatch → in transit → receive → complete. Stock changes follow the physical lifecycle." tier="PLUS"/>{message?<div className="purchase-message">{message}</div>:null}<div className="settings-grid"><form className="panel" onSubmit={create}><h3>Request Transfer</h3>{dest.length===0?<EmptyState title="No transfer destination" message="Only shops inside the same organization can be destinations."/>:<div className="settings-fields"><label>Destination<select value={destination} onChange={e=>setDestination(e.target.value)} required><option value="">Select branch</option>{dest.map(d=><option key={d.shop_id} value={d.shop_id}>{d.shop_name}</option>)}</select></label><label>Product<select value={productId} onChange={e=>setProductId(e.target.value)} required><option value="">Select product</option>{products.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name} · stock {getStock(p.id)}</option>)}</select></label><label>Quantity<input type="number" min="1" max={productId?getStock(productId):99999} value={qty} onChange={e=>setQty(e.target.value)} required/></label><button className="primary-button">Request</button></div>}</form><section className="panel"><h3>Transaction Safety</h3><p>Approval reserves permission only. Source stock is deducted only at Dispatch. Destination stock is increased only at Receive.</p><p>Every inventory change is performed inside a database RPC and recorded as a stock movement.</p></section></div><section className="panel" style={{marginTop:16}}><h3>Transfer Queue</h3>{transfers.length===0?<EmptyState title="No transfers" message="Transfer requests will appear here."/>:<div className="data-table-wrapper"><table className="data-table sticky"><thead><tr><th>Created</th><th>Direction</th><th>Qty</th><th>Status</th><th>Dispatched</th><th>Received</th><th>Action</th></tr></thead><tbody>{transfers.map(t=>{const incoming=t.destination_shop_id===profile?.shop_id;return <tr key={t.id}><td>{new Date(t.created_at).toLocaleString("en-IN")}</td><td>{incoming?"INCOMING":"OUTGOING"}</td><td>{(t.stock_transfer_items||[]).reduce((s,i)=>s+Number(i.quantity||0),0)}</td><td><StatusBadge status={t.status}/></td><td>{t.dispatched_at?new Date(t.dispatched_at).toLocaleString("en-IN"):"-"}</td><td>{t.received_at?new Date(t.received_at).toLocaleString("en-IN"):"-"}</td><td><div className="button-row compact">{actions(t)}</div></td></tr>})}</tbody></table></div>}</section></div>}
src/pages/Users.jsx:14:  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "CASHIER" });
src/pages/Users.jsx:15:  const isAdmin = profile?.role === "ADMIN";
src/pages/Users.jsx:35:      await callFunction({ action: "create", fullName: form.fullName, email: form.email, password: form.password, role: form.role });
src/pages/Users.jsx:36:      setForm({ fullName: "", email: "", password: "", role: "CASHIER" });
src/pages/Users.jsx:48:  async function setRole(userId, role) {
src/pages/Users.jsx:50:    try { await callFunction({ action: "set_role", userId, role }); setMessage(`Role changed to ${role}.`); await loadUsers(); }
src/pages/Users.jsx:51:    catch (error) { setMessage(error.message || "Unable to change user role."); }
src/pages/Users.jsx:55:  if (!isAdmin) return <section className="panel"><h2>Users</h2><p>Only the Shop Admin can manage users and roles.</p></section>;
src/pages/Users.jsx:67:          <label>Role<select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}><option value="CASHIER">Cashier</option><option value="MANAGER">Manager</option></select></label>
src/pages/Users.jsx:73:        <div className="role-rule-list">
src/pages/Users.jsx:74:          <div><StatusBadge status="CASHIER"/><span>Sell, scan, own shift, permitted sales/returns and offline queue.</span></div>
src/pages/Users.jsx:75:          <div><StatusBadge status="MANAGER"/><span>Operational control: products, purchasing, inventory, approvals, expenses and reports.</span></div>
src/pages/Users.jsx:76:          <div><StatusBadge status="ADMIN"/><span>Owner/Admin functions: Owner Center, users, settings, backup and audit.</span></div>
src/pages/Users.jsx:78:        <Link to="/admin/access">Open the complete role access matrix →</Link>
src/pages/Users.jsx:84:      {users.length === 0 ? <EmptyState title="No shop users" message="Create the first Manager or Cashier account above."/> : <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Access Management</th></tr></thead><tbody>{users.map((item)=><tr key={item.id}><td><strong>{item.full_name}</strong></td><td>{item.email || "-"}</td><td>{item.role === "ADMIN" ? <StatusBadge status="ADMIN"/> : <select className="role-select" value={item.role} disabled={busyId===item.id} onChange={(e)=>setRole(item.id,e.target.value)}><option value="CASHIER">Cashier</option><option value="MANAGER">Manager</option></select>}</td><td><StatusBadge status={item.active ? "ACTIVE" : "INACTIVE"}/></td><td>{item.role === "ADMIN" ? <span className="muted-text">Platform controlled</span> : <button className="secondary-button" disabled={busyId===item.id} onClick={()=>setActive(item.id,!item.active)}>{item.active ? "Disable Access" : "Enable Access"}</button>}</td></tr>)}</tbody></table></div>}
supabase/.temp/linked-project.json:1:{"ref":"uiurgplnsgmawvxhjzzp","name":"WineShopPOS","organization_id":"ixlgtwrnkiqepmcpjvva","organization_slug":"ixlgtwrnkiqepmcpjvva"}
supabase/config.toml:20:# `postgres` are reachable through the Data API roles (`anon`, `authenticated`, `service_role`)
supabase/functions/manage-shop-users/index.ts:27:      .select("id,shop_id,role,active")
supabase/functions/manage-shop-users/index.ts:33:    if (callerProfile.role !== "ADMIN") throw new Error("Admin role required");
supabase/functions/manage-shop-users/index.ts:37:      .select("id,access_enabled,subscription_status,subscription_end_date,max_users")
supabase/functions/manage-shop-users/index.ts:38:      .eq("id", callerProfile.shop_id)
supabase/functions/manage-shop-users/index.ts:43:    const allowed = shop.access_enabled === true &&
supabase/functions/manage-shop-users/index.ts:44:      ["TRIAL", "ACTIVE"].includes(shop.subscription_status) &&
supabase/functions/manage-shop-users/index.ts:54:        .select("id,full_name,email,phone,avatar_url,role,active,created_at")
supabase/functions/manage-shop-users/index.ts:55:        .eq("shop_id", callerProfile.shop_id)
supabase/functions/manage-shop-users/index.ts:62:      const role = String(body.role || "").toUpperCase();
supabase/functions/manage-shop-users/index.ts:63:      if (!["MANAGER", "CASHIER"].includes(role)) {
supabase/functions/manage-shop-users/index.ts:64:        throw new Error("Shop Admin can create only MANAGER or CASHIER");
supabase/functions/manage-shop-users/index.ts:77:        .eq("shop_id", callerProfile.shop_id);
supabase/functions/manage-shop-users/index.ts:87:        shop_id: callerProfile.shop_id,
supabase/functions/manage-shop-users/index.ts:90:        role,
supabase/functions/manage-shop-users/index.ts:99:      const { error: membershipInsert } = await admin.from("user_shop_memberships").upsert({
supabase/functions/manage-shop-users/index.ts:101:        shop_id: callerProfile.shop_id,
supabase/functions/manage-shop-users/index.ts:102:        role,
supabase/functions/manage-shop-users/index.ts:104:      }, { onConflict: "user_id,shop_id" });
supabase/functions/manage-shop-users/index.ts:115:    if (action === "set_role") {
supabase/functions/manage-shop-users/index.ts:117:      const role = String(body.role || "").toUpperCase();
supabase/functions/manage-shop-users/index.ts:118:      if (!["MANAGER", "CASHIER"].includes(role)) throw new Error("Role must be MANAGER or CASHIER");
supabase/functions/manage-shop-users/index.ts:119:      if (targetId === callerProfile.id) throw new Error("Shop ADMIN role is platform controlled");
supabase/functions/manage-shop-users/index.ts:123:        .select("id,shop_id,role,active")
supabase/functions/manage-shop-users/index.ts:125:        .eq("shop_id", callerProfile.shop_id)
supabase/functions/manage-shop-users/index.ts:128:      if (target.role === "ADMIN") throw new Error("Shop ADMIN role is platform controlled");
supabase/functions/manage-shop-users/index.ts:132:        .update({ role })
supabase/functions/manage-shop-users/index.ts:134:        .eq("shop_id", callerProfile.shop_id);
supabase/functions/manage-shop-users/index.ts:138:        .from("user_shop_memberships")
supabase/functions/manage-shop-users/index.ts:139:        .upsert({ user_id: targetId, shop_id: callerProfile.shop_id, role, active: target.active }, { onConflict: "user_id,shop_id" });
supabase/functions/manage-shop-users/index.ts:142:        await admin.from("profiles").update({ role: target.role }).eq("id", targetId).eq("shop_id", callerProfile.shop_id);
supabase/functions/manage-shop-users/index.ts:154:        .select("id,shop_id,role,active")
supabase/functions/manage-shop-users/index.ts:156:        .eq("shop_id", callerProfile.shop_id)
supabase/functions/manage-shop-users/index.ts:160:      if (target.role === "ADMIN") throw new Error("Shop ADMIN is platform controlled");
supabase/functions/manage-shop-users/index.ts:163:        .from("profiles").update({ active }).eq("id", targetId).eq("shop_id", callerProfile.shop_id);
supabase/functions/manage-shop-users/index.ts:167:        .from("user_shop_memberships")
supabase/functions/manage-shop-users/index.ts:168:        .upsert({ user_id: targetId, shop_id: callerProfile.shop_id, role: target.role, active }, { onConflict: "user_id,shop_id" });
supabase/functions/manage-shop-users/index.ts:170:        await admin.from("profiles").update({ active: target.active }).eq("id", targetId).eq("shop_id", callerProfile.shop_id);
supabase/functions/ocr-invoice/index.ts:72:      .select("role,active,shop_id")
supabase/functions/ocr-invoice/index.ts:79:      !["ADMIN", "MANAGER"].includes(profile.role)
supabase/functions/ocr-invoice/index.ts:81:      throw new Error("Manager or Admin role required");
supabase/migrations/20260829190000_chapters_16_26.sql:11:-- Shops may only transfer stock when they share organization_id.
supabase/migrations/20260829190000_chapters_16_26.sql:21:alter table public.shops add column if not exists organization_id uuid references public.organizations(id) on delete restrict;
supabase/migrations/20260829190000_chapters_16_26.sql:33:  for r in select id, name from public.shops where organization_id is null
supabase/migrations/20260829190000_chapters_16_26.sql:36:    update public.shops set organization_id = v_org where id = r.id;
supabase/migrations/20260829190000_chapters_16_26.sql:40:alter table public.shops alter column organization_id set not null;
supabase/migrations/20260829190000_chapters_16_26.sql:41:create index if not exists idx_shops_organization on public.shops(organization_id);
supabase/migrations/20260829190000_chapters_16_26.sql:43:create or replace function public.current_organization_id()
supabase/migrations/20260829190000_chapters_16_26.sql:50:  select s.organization_id
supabase/migrations/20260829190000_chapters_16_26.sql:52:  where s.id = public.current_shop_id()
supabase/migrations/20260829190000_chapters_16_26.sql:63:  on public.sales(shop_id, client_sale_id)
supabase/migrations/20260829190000_chapters_16_26.sql:102:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:117:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:127:create index if not exists idx_return_requests_shop_sale on public.sale_return_requests(shop_id, sale_id, created_at desc);
supabase/migrations/20260829190000_chapters_16_26.sql:131:-- CHAPTER 18: CASHIER SHIFT / DAY CLOSE
supabase/migrations/20260829190000_chapters_16_26.sql:135:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:154:  on public.cashier_shifts(shop_id, cashier_id)
supabase/migrations/20260829190000_chapters_16_26.sql:156:create index if not exists idx_shifts_shop_date on public.cashier_shifts(shop_id, opened_at desc);
supabase/migrations/20260829190000_chapters_16_26.sql:171:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:181:  unique(shop_id, count_number)
supabase/migrations/20260829190000_chapters_16_26.sql:186:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:203:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:213:  unique(shop_id, po_number)
supabase/migrations/20260829190000_chapters_16_26.sql:221:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:237:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:247:create index if not exists idx_supplier_payments_supplier on public.supplier_payments(shop_id, supplier_id, payment_date desc);
supabase/migrations/20260829190000_chapters_16_26.sql:251:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:263:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:276:  organization_id uuid not null references public.organizations(id) on delete restrict,
supabase/migrations/20260829190000_chapters_16_26.sql:277:  source_shop_id uuid not null references public.shops(id) on delete restrict,
supabase/migrations/20260829190000_chapters_16_26.sql:278:  destination_shop_id uuid not null references public.shops(id) on delete restrict,
supabase/migrations/20260829190000_chapters_16_26.sql:285:  check(source_shop_id <> destination_shop_id)
supabase/migrations/20260829190000_chapters_16_26.sql:295:create index if not exists idx_transfers_source on public.stock_transfers(source_shop_id, created_at desc);
supabase/migrations/20260829190000_chapters_16_26.sql:296:create index if not exists idx_transfers_destination on public.stock_transfers(destination_shop_id, created_at desc);
supabase/migrations/20260829190000_chapters_16_26.sql:303:  shop_id uuid references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:304:  organization_id uuid references public.organizations(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:314:create index if not exists idx_audit_shop_time on public.audit_logs(shop_id, created_at desc);
supabase/migrations/20260829190000_chapters_16_26.sql:322:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829190000_chapters_16_26.sql:329:  unique(shop_id, supplier_id, alias_text)
supabase/migrations/20260829190000_chapters_16_26.sql:337:  p_shop_id uuid,
supabase/migrations/20260829190000_chapters_16_26.sql:353:  select organization_id into v_org from public.shops where id = p_shop_id;
supabase/migrations/20260829190000_chapters_16_26.sql:354:  insert into public.audit_logs(shop_id, organization_id, actor_id, action, entity_type, entity_id, old_data, new_data, metadata)
supabase/migrations/20260829190000_chapters_16_26.sql:355:  values (p_shop_id, v_org, auth.uid(), p_action, p_entity_type, p_entity_id, p_old_data, p_new_data, coalesce(p_metadata,'{}'::jsonb));
supabase/migrations/20260829190000_chapters_16_26.sql:373:    v_shop := (v_new->>'shop_id')::uuid;
supabase/migrations/20260829190000_chapters_16_26.sql:380:    v_shop := coalesce((v_new->>'shop_id')::uuid, (v_old->>'shop_id')::uuid);
supabase/migrations/20260829190000_chapters_16_26.sql:388:    v_shop := (v_old->>'shop_id')::uuid;
supabase/migrations/20260829190000_chapters_16_26.sql:419:  shop_id uuid,
supabase/migrations/20260829190000_chapters_16_26.sql:443:  select p.id, p.shop_id, p.barcode, p.sku, p.product_name, p.brand,
supabase/migrations/20260829190000_chapters_16_26.sql:446:         case when public.current_user_role() in ('ADMIN','MANAGER') then p.purchase_price else null end,
supabase/migrations/20260829190000_chapters_16_26.sql:451:  where p.shop_id = public.assert_shop_access()
supabase/migrations/20260829190000_chapters_16_26.sql:486:  where id = p_product_id and shop_id = v_shop;
supabase/migrations/20260829190000_chapters_16_26.sql:501:  update public.products set active = p_active where id = p_product_id and shop_id = v_shop;
supabase/migrations/20260829190000_chapters_16_26.sql:538:  select * into v_sale from public.sales where id=p_sale_id and shop_id=v_shop;
supabase/migrations/20260829190000_chapters_16_26.sql:543:  insert into public.sale_return_requests(shop_id,sale_id,requested_by,reason,refund_method,refund_reference)
supabase/migrations/20260829190000_chapters_16_26.sql:552:    where id=(v_item->>'sale_item_id')::uuid and sale_id=p_sale_id and shop_id=v_shop;
supabase/migrations/20260829190000_chapters_16_26.sql:562:    insert into public.sale_return_items(shop_id,return_request_id,sale_item_id,product_id,quantity,unit_refund,line_refund)
supabase/migrations/20260829190000_chapters_16_26.sql:592:  select * into v_req from public.sale_return_requests where id=p_request_id and shop_id=v_shop for update;
supabase/migrations/20260829190000_chapters_16_26.sql:598:    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=r.product_id for update;
supabase/migrations/20260829190000_chapters_16_26.sql:599:    if v_before is null then v_before := 0; insert into public.inventory(shop_id,product_id,quantity) values(v_shop,r.product_id,0) on conflict do nothing; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:601:    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=r.product_id;
supabase/migrations/20260829190000_chapters_16_26.sql:602:    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
supabase/migrations/20260829190000_chapters_16_26.sql:607:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,return_request_id,shift_id)
supabase/migrations/20260829190000_chapters_16_26.sql:636:  where id=p_request_id and shop_id=v_shop and status='PENDING';
supabase/migrations/20260829190000_chapters_16_26.sql:657:  select * into v_sale from public.sales where id=p_sale_id and shop_id=v_shop for update;
supabase/migrations/20260829190000_chapters_16_26.sql:665:    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=r.product_id for update;
supabase/migrations/20260829190000_chapters_16_26.sql:667:    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=r.product_id;
supabase/migrations/20260829190000_chapters_16_26.sql:668:    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
supabase/migrations/20260829190000_chapters_16_26.sql:673:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,shift_id)
supabase/migrations/20260829190000_chapters_16_26.sql:692:  if exists(select 1 from public.cashier_shifts where shop_id=v_shop and cashier_id=auth.uid() and status in ('OPEN','CLOSE_REQUESTED')) then raise exception 'You already have an active shift'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:693:  insert into public.cashier_shifts(shop_id,cashier_id,opening_cash,expected_cash,notes)
supabase/migrations/20260829190000_chapters_16_26.sql:708:  where shop_id=public.assert_shop_access() and cashier_id=auth.uid() and status in ('OPEN','CLOSE_REQUESTED')
supabase/migrations/20260829190000_chapters_16_26.sql:721:  select * into v_shift from public.cashier_shifts where id=p_shift_id and shop_id=public.assert_shop_access();
supabase/migrations/20260829190000_chapters_16_26.sql:745:  select * into v_shift from public.cashier_shifts where shop_id=v_shop and cashier_id=auth.uid() and status='OPEN' order by opened_at desc limit 1 for update;
supabase/migrations/20260829190000_chapters_16_26.sql:765:  where id=p_shift_id and shop_id=v_shop and status='CLOSE_REQUESTED';
supabase/migrations/20260829190000_chapters_16_26.sql:783:  if exists(select 1 from public.stock_counts where shop_id=v_shop and status in ('OPEN','SUBMITTED')) then raise exception 'An active stock count already exists'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:785:  insert into public.stock_counts(shop_id,count_number,created_by,notes) values(v_shop,v_num,auth.uid(),p_notes) returning id into v_id;
supabase/migrations/20260829190000_chapters_16_26.sql:786:  insert into public.stock_count_items(shop_id,stock_count_id,product_id,expected_quantity)
supabase/migrations/20260829190000_chapters_16_26.sql:788:  from public.products p left join public.inventory i on i.shop_id=v_shop and i.product_id=p.id
supabase/migrations/20260829190000_chapters_16_26.sql:789:  where p.shop_id=v_shop and p.active=true;
supabase/migrations/20260829190000_chapters_16_26.sql:804:  if not exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='OPEN') then raise exception 'Stock count is not open'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:805:  select id into v_product from public.products where shop_id=v_shop and barcode=trim(p_barcode) and active=true;
supabase/migrations/20260829190000_chapters_16_26.sql:827:  where stock_count_id=p_stock_count_id and product_id=p_product_id and shop_id=v_shop
supabase/migrations/20260829190000_chapters_16_26.sql:828:    and exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='OPEN');
supabase/migrations/20260829190000_chapters_16_26.sql:842:  if not exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='OPEN') then raise exception 'Stock count not open'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:843:  update public.stock_count_items set counted_quantity=0 where stock_count_id=p_stock_count_id and shop_id=v_shop and counted_quantity is null;
supabase/migrations/20260829190000_chapters_16_26.sql:857:  if exists(select 1 from public.stock_count_items where stock_count_id=p_stock_count_id and shop_id=v_shop and counted_quantity is null) then raise exception 'Uncounted SKUs remain. Scan them or explicitly mark unseen SKUs as zero.'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:858:  update public.stock_counts set status='SUBMITTED',submitted_by=auth.uid(),submitted_at=now() where id=p_stock_count_id and shop_id=v_shop and status='OPEN';
supabase/migrations/20260829190000_chapters_16_26.sql:872:  if not exists(select 1 from public.stock_counts where id=p_stock_count_id and shop_id=v_shop and status='SUBMITTED') then raise exception 'Submitted stock count not found'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:873:  for r in select * from public.stock_count_items where stock_count_id=p_stock_count_id and shop_id=v_shop and counted_quantity is distinct from expected_quantity
supabase/migrations/20260829190000_chapters_16_26.sql:875:    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=r.product_id for update;
supabase/migrations/20260829190000_chapters_16_26.sql:877:    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=r.product_id;
supabase/migrations/20260829190000_chapters_16_26.sql:878:    insert into public.stock_adjustments(shop_id,product_id,adjustment_type,quantity_change,reason,notes,created_by)
supabase/migrations/20260829190000_chapters_16_26.sql:880:    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
supabase/migrations/20260829190000_chapters_16_26.sql:891:create or replace function public.next_po_number(p_shop_id uuid)
supabase/migrations/20260829190000_chapters_16_26.sql:899:  insert into public.shop_counters(shop_id) values(p_shop_id) on conflict(shop_id) do nothing;
supabase/migrations/20260829190000_chapters_16_26.sql:900:  update public.shop_counters set po_counter=po_counter+1 where shop_id=p_shop_id returning po_counter into v_counter;
supabase/migrations/20260829190000_chapters_16_26.sql:914:  if not exists(select 1 from public.suppliers where id=p_supplier_id and shop_id=v_shop and active=true) then raise exception 'Invalid supplier'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:917:  insert into public.purchase_orders(shop_id,po_number,supplier_id,expected_date,notes,created_by)
supabase/migrations/20260829190000_chapters_16_26.sql:922:    if not exists(select 1 from public.products where id=v_product and shop_id=v_shop and active=true) then raise exception 'Invalid product'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:923:    insert into public.purchase_order_items(shop_id,purchase_order_id,product_id,ordered_quantity,purchase_price,line_total)
supabase/migrations/20260829190000_chapters_16_26.sql:943:  update public.purchase_orders set status=p_status where id=p_po_id and shop_id=v_shop and status in ('DRAFT','SENT');
supabase/migrations/20260829190000_chapters_16_26.sql:965:  select * into v_po from public.purchase_orders where id=p_po_id and shop_id=v_shop and status in ('DRAFT','SENT','PARTIALLY_RECEIVED') for update;
supabase/migrations/20260829190000_chapters_16_26.sql:1010:  if not exists(select 1 from public.suppliers where id=p_supplier_id and shop_id=v_shop) then raise exception 'Supplier not found'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:1011:  insert into public.supplier_payments(shop_id,supplier_id,amount,payment_method,reference_number,payment_date,notes,created_by)
supabase/migrations/20260829190000_chapters_16_26.sql:1028:  insert into public.purchase_returns(shop_id,supplier_id,purchase_id,reason,created_by) values(v_shop,p_supplier_id,p_purchase_id,trim(p_reason),auth.uid()) returning id into v_id;
supabase/migrations/20260829190000_chapters_16_26.sql:1032:    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=v_product for update;
supabase/migrations/20260829190000_chapters_16_26.sql:1034:    v_after:=v_before-v_qty; update public.inventory set quantity=v_after where shop_id=v_shop and product_id=v_product;
supabase/migrations/20260829190000_chapters_16_26.sql:1035:    insert into public.purchase_return_items(shop_id,purchase_return_id,product_id,quantity,purchase_price,line_total)
supabase/migrations/20260829190000_chapters_16_26.sql:1037:    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
supabase/migrations/20260829190000_chapters_16_26.sql:1054:  with s as (select id,supplier_name from public.suppliers where shop_id=public.assert_shop_access()),
supabase/migrations/20260829190000_chapters_16_26.sql:1055:  p as (select supplier_id,sum(total) total from public.purchases where shop_id=public.current_shop_id() and status='RECEIVED' group by supplier_id),
supabase/migrations/20260829190000_chapters_16_26.sql:1056:  pay as (select supplier_id,sum(amount) total from public.supplier_payments where shop_id=public.current_shop_id() group by supplier_id),
supabase/migrations/20260829190000_chapters_16_26.sql:1057:  pr as (select supplier_id,sum(total) total from public.purchase_returns where shop_id=public.current_shop_id() and status='COMPLETED' group by supplier_id)
supabase/migrations/20260829190000_chapters_16_26.sql:1071:  where pi.shop_id=public.assert_shop_access() and pi.product_id=p_product_id and pu.status='RECEIVED'
supabase/migrations/20260829190000_chapters_16_26.sql:1087:    from public.products p left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
supabase/migrations/20260829190000_chapters_16_26.sql:1088:    where p.shop_id=public.assert_shop_access() and p.active=true
supabase/migrations/20260829190000_chapters_16_26.sql:1092:    where si.shop_id=public.current_shop_id() and s.status not in ('VOID','RETURNED') and s.created_at>=now()-(greatest(p_history_days,1)||' days')::interval
supabase/migrations/20260829190000_chapters_16_26.sql:1113:returns table(shop_id uuid,shop_name text)
supabase/migrations/20260829190000_chapters_16_26.sql:1120:  where s.organization_id=public.current_organization_id() and s.id<>public.assert_shop_access() and s.active=true and s.access_enabled=true
supabase/migrations/20260829190000_chapters_16_26.sql:1124:create or replace function public.create_stock_transfer(p_destination_shop_id uuid,p_items jsonb,p_notes text default null)
supabase/migrations/20260829190000_chapters_16_26.sql:1132:  v_source:=public.assert_shop_access(); perform public.assert_manager_or_admin(); v_org:=public.current_organization_id();
supabase/migrations/20260829190000_chapters_16_26.sql:1133:  if not exists(select 1 from public.shops where id=p_destination_shop_id and organization_id=v_org and id<>v_source and active=true) then raise exception 'Destination is not a branch in this organization'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:1135:  insert into public.stock_transfers(organization_id,source_shop_id,destination_shop_id,requested_by,notes)
supabase/migrations/20260829190000_chapters_16_26.sql:1136:  values(v_org,v_source,p_destination_shop_id,auth.uid(),p_notes) returning id into v_id;
supabase/migrations/20260829190000_chapters_16_26.sql:1140:    if not exists(select 1 from public.products where id=v_product and shop_id=v_source and active=true) then raise exception 'Source product not found'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:1143:  perform public.write_audit(v_source,'TRANSFER_REQUESTED','stock_transfer',v_id::text,null,null,jsonb_build_object('destination',p_destination_shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1157:  update public.stock_transfers set status='CANCELLED',reviewed_at=now() where id=p_transfer_id and source_shop_id=v_shop and status='REQUESTED';
supabase/migrations/20260829190000_chapters_16_26.sql:1173:  where id=p_transfer_id and destination_shop_id=v_shop and status='REQUESTED';
supabase/migrations/20260829190000_chapters_16_26.sql:1189:  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status='REQUESTED' for update;
supabase/migrations/20260829190000_chapters_16_26.sql:1191:  if v_transfer.organization_id<>public.current_organization_id() then raise exception 'Organization mismatch'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:1195:    select * into v_src_product from public.products where id=r.source_product_id and shop_id=v_transfer.source_shop_id;
supabase/migrations/20260829190000_chapters_16_26.sql:1197:    select quantity into v_before_src from public.inventory where shop_id=v_transfer.source_shop_id and product_id=v_src_product.id for update;
supabase/migrations/20260829190000_chapters_16_26.sql:1200:    select id into v_dest_product from public.products where shop_id=v_dest and barcode=v_src_product.barcode limit 1;
supabase/migrations/20260829190000_chapters_16_26.sql:1204:        select id into v_dest_cat from public.categories where shop_id=v_dest and lower(name)=lower(v_cat_name) limit 1;
supabase/migrations/20260829190000_chapters_16_26.sql:1205:        if v_dest_cat is null then insert into public.categories(shop_id,name) values(v_dest,v_cat_name) returning id into v_dest_cat; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:1207:      insert into public.products(shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,alcohol_percentage,purchase_price,mrp,selling_price,minimum_stock,units_per_case,active,created_by)
supabase/migrations/20260829190000_chapters_16_26.sql:1210:      insert into public.inventory(shop_id,product_id,quantity) values(v_dest,v_dest_product,0);
supabase/migrations/20260829190000_chapters_16_26.sql:1213:    select quantity into v_before_dest from public.inventory where shop_id=v_dest and product_id=v_dest_product for update;
supabase/migrations/20260829190000_chapters_16_26.sql:1215:    update public.inventory set quantity=v_after_src where shop_id=v_transfer.source_shop_id and product_id=v_src_product.id;
supabase/migrations/20260829190000_chapters_16_26.sql:1216:    update public.inventory set quantity=v_after_dest where shop_id=v_dest and product_id=v_dest_product;
supabase/migrations/20260829190000_chapters_16_26.sql:1218:    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
supabase/migrations/20260829190000_chapters_16_26.sql:1219:    values(v_transfer.source_shop_id,v_src_product.id,'TRANSFER_OUT',-r.quantity,v_before_src,v_after_src,'STOCK_TRANSFER',p_transfer_id,'Branch transfer out',auth.uid());
supabase/migrations/20260829190000_chapters_16_26.sql:1220:    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
supabase/migrations/20260829190000_chapters_16_26.sql:1224:  perform public.write_audit(v_dest,'TRANSFER_APPROVED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('source',v_transfer.source_shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1245:  v_shop uuid; v_existing uuid; v_sale_id uuid; v_invoice text; v_item jsonb; v_product uuid; v_name text; v_barcode text; v_qty integer; v_price numeric; v_before integer; v_after integer; v_subtotal numeric:=0; v_total numeric; v_shift uuid; v_role text;
supabase/migrations/20260829190000_chapters_16_26.sql:1247:  v_shop:=public.assert_shop_access(); v_role:=public.current_user_role();
supabase/migrations/20260829190000_chapters_16_26.sql:1249:  select id into v_existing from public.sales where shop_id=v_shop and client_sale_id=p_client_sale_id;
supabase/migrations/20260829190000_chapters_16_26.sql:1258:    where shop_id=v_shop and cashier_id=auth.uid() and status='OPEN'
supabase/migrations/20260829190000_chapters_16_26.sql:1266:    where shop_id=v_shop
supabase/migrations/20260829190000_chapters_16_26.sql:1273:  if v_role='CASHIER' and v_shift is null then raise exception 'SHIFT_REQUIRED'; end if;
supabase/migrations/20260829190000_chapters_16_26.sql:1276:  insert into public.sales(shop_id,invoice_number,cashier_id,status,payment_status,shift_id,client_sale_id,offline_created_at)
supabase/migrations/20260829190000_chapters_16_26.sql:1282:    select product_name,barcode,selling_price into v_name,v_barcode,v_price from public.products where id=v_product and shop_id=v_shop and active=true;
supabase/migrations/20260829190000_chapters_16_26.sql:1284:    select quantity into v_before from public.inventory where shop_id=v_shop and product_id=v_product for update;
supabase/migrations/20260829190000_chapters_16_26.sql:1287:    update public.inventory set quantity=v_after where shop_id=v_shop and product_id=v_product;
supabase/migrations/20260829190000_chapters_16_26.sql:1288:    insert into public.sale_items(shop_id,sale_id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,discount,line_total)
supabase/migrations/20260829190000_chapters_16_26.sql:1290:    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
supabase/migrations/20260829190000_chapters_16_26.sql:1297:  insert into public.payments(shop_id,sale_id,payment_method,amount,reference_number,payment_type,shift_id)
supabase/migrations/20260829190000_chapters_16_26.sql:1329:    where pa.shop_id=public.assert_shop_access() and (pa.supplier_id is null or p_supplier_id is null or pa.supplier_id=p_supplier_id)
supabase/migrations/20260829190000_chapters_16_26.sql:1332:    from public.products p cross join q where p.shop_id=public.current_shop_id() and p.active=true
supabase/migrations/20260829190000_chapters_16_26.sql:1361:  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id)
supabase/migrations/20260829190000_chapters_16_26.sql:1362:  and (public.current_user_role() in ('ADMIN','MANAGER') or cashier_id=auth.uid())
supabase/migrations/20260829190000_chapters_16_26.sql:1367:  shop_id=public.current_shop_id() and exists(select 1 from public.sales s where s.id=sale_id)
supabase/migrations/20260829190000_chapters_16_26.sql:1372:  shop_id=public.current_shop_id() and exists(select 1 from public.sales s where s.id=sale_id)
supabase/migrations/20260829190000_chapters_16_26.sql:1377:  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER')
supabase/migrations/20260829190000_chapters_16_26.sql:1381:  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER')
supabase/migrations/20260829190000_chapters_16_26.sql:1386:create policy organizations_select on public.organizations for select to authenticated using (id=public.current_organization_id() or public.is_platform_admin());
supabase/migrations/20260829190000_chapters_16_26.sql:1390:  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and (public.current_user_role() in ('ADMIN','MANAGER') or requested_by=auth.uid())
supabase/migrations/20260829190000_chapters_16_26.sql:1394:  shop_id=public.current_shop_id() and exists(select 1 from public.sale_return_requests r where r.id=return_request_id)
supabase/migrations/20260829190000_chapters_16_26.sql:1399:  shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and (public.current_user_role() in ('ADMIN','MANAGER') or cashier_id=auth.uid())
supabase/migrations/20260829190000_chapters_16_26.sql:1403:create policy stock_counts_select on public.stock_counts for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1405:create policy stock_count_items_select on public.stock_count_items for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1408:create policy po_select on public.purchase_orders for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1410:create policy po_items_select on public.purchase_order_items for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1412:create policy supplier_payments_select on public.supplier_payments for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1414:create policy purchase_returns_select on public.purchase_returns for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1416:create policy purchase_return_items_select on public.purchase_return_items for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1420:  public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(public.current_shop_id()) and (source_shop_id=public.current_shop_id() or destination_shop_id=public.current_shop_id())
supabase/migrations/20260829190000_chapters_16_26.sql:1424:  exists(select 1 from public.stock_transfers t where t.id=transfer_id and (t.source_shop_id=public.current_shop_id() or t.destination_shop_id=public.current_shop_id()) and public.current_user_role() in ('ADMIN','MANAGER'))
supabase/migrations/20260829190000_chapters_16_26.sql:1428:create policy audit_select on public.audit_logs for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and public.shop_access_allowed(shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1431:create policy aliases_select on public.product_aliases for select to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1435:create policy aliases_manage on public.product_aliases for all to authenticated using (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id)) with check (shop_id=public.current_shop_id() and public.current_user_role() in ('ADMIN','MANAGER') and public.shop_access_allowed(shop_id));
supabase/migrations/20260829190000_chapters_16_26.sql:1477:-- Chapter 16+ reads products through get_products(), which returns purchase_price only to ADMIN/MANAGER.
supabase/migrations/20260829190000_chapters_16_26.sql:1479:grant select(id,shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,alcohol_percentage,mrp,selling_price,minimum_stock,units_per_case,active,created_by,created_at,updated_at) on public.products to authenticated;
supabase/migrations/20260829233000_master_reconsolidation.sql:20:create table if not exists public.user_shop_memberships (
supabase/migrations/20260829233000_master_reconsolidation.sql:22:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829233000_master_reconsolidation.sql:23:  role text not null check (role in ('ADMIN','MANAGER','CASHIER')),
supabase/migrations/20260829233000_master_reconsolidation.sql:27:  primary key (user_id, shop_id)
supabase/migrations/20260829233000_master_reconsolidation.sql:30:drop trigger if exists trg_user_shop_memberships_updated_at on public.user_shop_memberships;
supabase/migrations/20260829233000_master_reconsolidation.sql:31:create trigger trg_user_shop_memberships_updated_at before update on public.user_shop_memberships
supabase/migrations/20260829233000_master_reconsolidation.sql:34:insert into public.user_shop_memberships(user_id,shop_id,role,active)
supabase/migrations/20260829233000_master_reconsolidation.sql:35:select id,shop_id,role,active from public.profiles
supabase/migrations/20260829233000_master_reconsolidation.sql:36:on conflict (user_id,shop_id) do update
supabase/migrations/20260829233000_master_reconsolidation.sql:37:set role=excluded.role,active=excluded.active;
supabase/migrations/20260829233000_master_reconsolidation.sql:43:  shop_id uuid,
supabase/migrations/20260829233000_master_reconsolidation.sql:49:  role text,
supabase/migrations/20260829233000_master_reconsolidation.sql:53:  organization_id uuid,
supabase/migrations/20260829233000_master_reconsolidation.sql:64:    p.shop_id,
supabase/migrations/20260829233000_master_reconsolidation.sql:70:    p.role,
supabase/migrations/20260829233000_master_reconsolidation.sql:74:    s.organization_id,
supabase/migrations/20260829233000_master_reconsolidation.sql:78:  join public.shops s on s.id=p.shop_id
supabase/migrations/20260829233000_master_reconsolidation.sql:79:  left join public.organizations o on o.id=s.organization_id
supabase/migrations/20260829233000_master_reconsolidation.sql:105:returns table(shop_id uuid,shop_name text,shop_slug text,role text,is_current boolean)
supabase/migrations/20260829233000_master_reconsolidation.sql:111:  select m.shop_id,s.name,s.slug,m.role,(m.shop_id=public.current_shop_id())
supabase/migrations/20260829233000_master_reconsolidation.sql:112:  from public.user_shop_memberships m
supabase/migrations/20260829233000_master_reconsolidation.sql:113:  join public.shops s on s.id=m.shop_id
supabase/migrations/20260829233000_master_reconsolidation.sql:114:  where m.user_id=auth.uid() and m.active=true and s.active=true and s.access_enabled=true
supabase/migrations/20260829233000_master_reconsolidation.sql:115:    and s.subscription_status in ('TRIAL','ACTIVE')
supabase/migrations/20260829233000_master_reconsolidation.sql:117:  order by (m.shop_id=public.current_shop_id()) desc,s.name;
supabase/migrations/20260829233000_master_reconsolidation.sql:120:create or replace function public.switch_shop(p_shop_id uuid)
supabase/migrations/20260829233000_master_reconsolidation.sql:126:declare v_role text;
supabase/migrations/20260829233000_master_reconsolidation.sql:128:  select m.role into v_role
supabase/migrations/20260829233000_master_reconsolidation.sql:129:  from public.user_shop_memberships m
supabase/migrations/20260829233000_master_reconsolidation.sql:130:  join public.shops s on s.id=m.shop_id
supabase/migrations/20260829233000_master_reconsolidation.sql:131:  where m.user_id=auth.uid() and m.shop_id=p_shop_id and m.active=true and s.active=true and s.access_enabled=true
supabase/migrations/20260829233000_master_reconsolidation.sql:132:    and s.subscription_status in ('TRIAL','ACTIVE')
supabase/migrations/20260829233000_master_reconsolidation.sql:134:  if v_role is null then raise exception 'You do not have access to this shop'; end if;
supabase/migrations/20260829233000_master_reconsolidation.sql:135:  update public.profiles set shop_id=p_shop_id,role=v_role where id=auth.uid() and active=true;
supabase/migrations/20260829233000_master_reconsolidation.sql:145:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829233000_master_reconsolidation.sql:149:  unique(shop_id,name)
supabase/migrations/20260829233000_master_reconsolidation.sql:154:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829233000_master_reconsolidation.sql:168:create index if not exists idx_expenses_shop_date on public.expenses(shop_id,expense_date desc);
supabase/migrations/20260829233000_master_reconsolidation.sql:170:insert into public.expense_categories(shop_id,name)
supabase/migrations/20260829233000_master_reconsolidation.sql:173:on conflict(shop_id,name) do nothing;
supabase/migrations/20260829233000_master_reconsolidation.sql:189:  if not exists(select 1 from public.expense_categories where id=p_category_id and shop_id=v_shop and active=true) then raise exception 'Expense category not found'; end if;
supabase/migrations/20260829233000_master_reconsolidation.sql:190:  insert into public.expenses(shop_id,category_id,expense_date,amount,description,payment_method,reference_number,entered_by)
supabase/migrations/20260829233000_master_reconsolidation.sql:208:  where id=p_expense_id and shop_id=v_shop and status='ACTIVE';
supabase/migrations/20260829233000_master_reconsolidation.sql:218:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829233000_master_reconsolidation.sql:230:create unique index if not exists uq_customers_shop_mobile on public.customers(shop_id,mobile) where mobile is not null and mobile<>'';
supabase/migrations/20260829233000_master_reconsolidation.sql:236:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829233000_master_reconsolidation.sql:246:create index if not exists idx_customer_credit_shop_customer on public.customer_credit_entries(shop_id,customer_id,created_at desc);
supabase/migrations/20260829233000_master_reconsolidation.sql:257:  if public.current_user_role() not in ('ADMIN','MANAGER','CASHIER') then raise exception 'Role not allowed'; end if;
supabase/migrations/20260829233000_master_reconsolidation.sql:259:  insert into public.customers(shop_id,full_name,mobile,email,notes,created_by)
supabase/migrations/20260829233000_master_reconsolidation.sql:274:  if not exists(select 1 from public.customers where id=p_customer_id and shop_id=v_shop and active=true) then raise exception 'Customer not found'; end if;
supabase/migrations/20260829233000_master_reconsolidation.sql:275:  update public.sales set customer_id=p_customer_id where id=p_sale_id and shop_id=v_shop;
supabase/migrations/20260829233000_master_reconsolidation.sql:292:  if not exists(select 1 from public.customers where id=p_customer_id and shop_id=v_shop and active=true) then raise exception 'Customer not found'; end if;
supabase/migrations/20260829233000_master_reconsolidation.sql:293:  if p_sale_id is not null and not exists(select 1 from public.sales where id=p_sale_id and shop_id=v_shop) then raise exception 'Sale not found'; end if;
supabase/migrations/20260829233000_master_reconsolidation.sql:294:  insert into public.customer_credit_entries(shop_id,customer_id,entry_type,amount,sale_id,reference_number,description,created_by)
supabase/migrations/20260829233000_master_reconsolidation.sql:312:  left join public.customer_credit_entries e on e.customer_id=c.id and e.shop_id=c.shop_id
supabase/migrations/20260829233000_master_reconsolidation.sql:313:  where c.shop_id=public.assert_shop_access() and c.active=true and public.current_user_role() in ('ADMIN','MANAGER')
supabase/migrations/20260829233000_master_reconsolidation.sql:322:  shop_id uuid primary key references public.shops(id) on delete cascade,
supabase/migrations/20260829233000_master_reconsolidation.sql:346:  insert into public.compliance_profiles(shop_id,state_code,state_name,license_number,license_type,license_valid_from,license_valid_to,excise_registration_number,notes,updated_by,updated_at)
supabase/migrations/20260829233000_master_reconsolidation.sql:348:  on conflict(shop_id) do update set state_code=excluded.state_code,state_name=excluded.state_name,license_number=excluded.license_number,license_type=excluded.license_type,license_valid_from=excluded.license_valid_from,license_valid_to=excluded.license_valid_to,excise_registration_number=excluded.excise_registration_number,notes=excluded.notes,updated_by=auth.uid(),updated_at=now();
supabase/migrations/20260829233000_master_reconsolidation.sql:356:  shop_id uuid not null references public.shops(id) on delete cascade,
supabase/migrations/20260829233000_master_reconsolidation.sql:377:  insert into public.backup_restore_tests(shop_id,environment,backup_reference,result,notes,tested_by)
supabase/migrations/20260829233000_master_reconsolidation.sql:402:    select purchase_price into new.cost_price_snapshot from public.products where id=new.product_id and shop_id=new.shop_id;
supabase/migrations/20260829233000_master_reconsolidation.sql:431:  update public.purchase_orders set status='APPROVAL_PENDING' where id=p_po_id and shop_id=v_shop and status='DRAFT';
supabase/migrations/20260829233000_master_reconsolidation.sql:446:  where id=p_po_id and shop_id=v_shop and status='APPROVAL_PENDING';
supabase/migrations/20260829233000_master_reconsolidation.sql:461:    update public.purchase_orders set status='SENT' where id=p_po_id and shop_id=v_shop and status='APPROVED';
supabase/migrations/20260829233000_master_reconsolidation.sql:463:    update public.purchase_orders set status='CANCELLED' where id=p_po_id and shop_id=v_shop and status in ('DRAFT','APPROVAL_PENDING','APPROVED','SENT');
supabase/migrations/20260829233000_master_reconsolidation.sql:484:  select * into v_po from public.purchase_orders where id=p_po_id and shop_id=v_shop and status in ('APPROVED','SENT','PARTIALLY_RECEIVED') for update;
supabase/migrations/20260829233000_master_reconsolidation.sql:539:  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status='REQUESTED' for update;
supabase/migrations/20260829233000_master_reconsolidation.sql:541:  if v_transfer.organization_id<>public.current_organization_id() then raise exception 'Organization mismatch'; end if;
supabase/migrations/20260829233000_master_reconsolidation.sql:543:  perform public.write_audit(v_dest,'TRANSFER_APPROVED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('source',v_transfer.source_shop_id));
supabase/migrations/20260829233000_master_reconsolidation.sql:556:  select * into v_transfer from public.stock_transfers where id=p_transfer_id and source_shop_id=v_source and status='APPROVED' for update;
supabase/migrations/20260829233000_master_reconsolidation.sql:559:    select * into v_src_product from public.products where id=r.source_product_id and shop_id=v_source;
supabase/migrations/20260829233000_master_reconsolidation.sql:561:    select quantity into v_before from public.inventory where shop_id=v_source and product_id=v_src_product.id for update;
supabase/migrations/20260829233000_master_reconsolidation.sql:563:    select id into v_dest_product from public.products where shop_id=v_transfer.destination_shop_id and barcode=v_src_product.barcode limit 1;
supabase/migrations/20260829233000_master_reconsolidation.sql:567:        select id into v_dest_cat from public.categories where shop_id=v_transfer.destination_shop_id and lower(name)=lower(v_cat_name) limit 1;
supabase/migrations/20260829233000_master_reconsolidation.sql:568:        if v_dest_cat is null then insert into public.categories(shop_id,name) values(v_transfer.destination_shop_id,v_cat_name) returning id into v_dest_cat; end if;
supabase/migrations/20260829233000_master_reconsolidation.sql:570:      insert into public.products(shop_id,barcode,sku,product_name,brand,category_id,subcategory,size_ml,alcohol_percentage,purchase_price,mrp,selling_price,minimum_stock,units_per_case,active,created_by)
supabase/migrations/20260829233000_master_reconsolidation.sql:571:      values(v_transfer.destination_shop_id,v_src_product.barcode,v_src_product.sku,v_src_product.product_name,v_src_product.brand,v_dest_cat,v_src_product.subcategory,v_src_product.size_ml,v_src_product.alcohol_percentage,v_src_product.purchase_price,v_src_product.mrp,v_src_product.selling_price,v_src_product.minimum_stock,v_src_product.units_per_case,true,auth.uid())
supabase/migrations/20260829233000_master_reconsolidation.sql:573:      insert into public.inventory(shop_id,product_id,quantity) values(v_transfer.destination_shop_id,v_dest_product,0);
supabase/migrations/20260829233000_master_reconsolidation.sql:577:    update public.inventory set quantity=v_after where shop_id=v_source and product_id=v_src_product.id;
supabase/migrations/20260829233000_master_reconsolidation.sql:578:    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
supabase/migrations/20260829233000_master_reconsolidation.sql:594:  update public.stock_transfers set status='IN_TRANSIT' where id=p_transfer_id and source_shop_id=v_shop and status='DISPATCHED';
supabase/migrations/20260829233000_master_reconsolidation.sql:608:  select * into v_transfer from public.stock_transfers where id=p_transfer_id and destination_shop_id=v_dest and status in ('DISPATCHED','IN_TRANSIT') for update;
supabase/migrations/20260829233000_master_reconsolidation.sql:612:    select quantity into v_before from public.inventory where shop_id=v_dest and product_id=r.destination_product_id for update;
supabase/migrations/20260829233000_master_reconsolidation.sql:614:    update public.inventory set quantity=v_after where shop_id=v_dest and product_id=r.destination_product_id;
supabase/migrations/20260829233000_master_reconsolidation.sql:615:    insert into public.stock_movements(shop_id,product_id,movement_type,quantity_change,quantity_before,quantity_after,reference_type,reference_id,reason,created_by)
supabase/migrations/20260829233000_master_reconsolidation.sql:619:  perform public.write_audit(v_dest,'TRANSFER_RECEIVED','stock_transfer',p_transfer_id::text,null,null,jsonb_build_object('source',v_transfer.source_shop_id));
supabase/migrations/20260829233000_master_reconsolidation.sql:631:  update public.stock_transfers set status='COMPLETED',completed_at=now() where id=p_transfer_id and destination_shop_id=v_dest and status='RECEIVED';
supabase/migrations/20260829233000_master_reconsolidation.sql:650:    where pi.shop_id=public.assert_shop_access() and pi.product_id=p_product_id and p.status='RECEIVED'
supabase/migrations/20260829233000_master_reconsolidation.sql:664:  with s as (select id,supplier_name from public.suppliers where shop_id=public.assert_shop_access() and active=true),
supabase/migrations/20260829233000_master_reconsolidation.sql:665:  p as (select supplier_id,count(*) cnt,sum(total) total from public.purchases where shop_id=public.current_shop_id() and status='RECEIVED' and invoice_date>=current_date-greatest(p_days,1) group by supplier_id),
supabase/migrations/20260829233000_master_reconsolidation.sql:666:  r as (select supplier_id,sum(total) total from public.purchase_returns where shop_id=public.current_shop_id() and status='COMPLETED' and created_at>=now()-(greatest(p_days,1)||' days')::interval group by supplier_id),
supabase/migrations/20260829233000_master_reconsolidation.sql:667:  pay as (select supplier_id,sum(amount) total from public.supplier_payments where shop_id=public.current_shop_id() and payment_date>=current_date-greatest(p_days,1) group by supplier_id),
supabase/migrations/20260829233000_master_reconsolidation.sql:668:  po as (select o.supplier_id,sum(i.ordered_quantity)::int ordered,sum(i.received_quantity)::int received from public.purchase_orders o join public.purchase_order_items i on i.purchase_order_id=o.id where o.shop_id=public.current_shop_id() and o.created_at>=now()-(greatest(p_days,1)||' days')::interval group by o.supplier_id)
supabase/migrations/20260829233000_master_reconsolidation.sql:686:  where sm.shop_id=public.assert_shop_access() and sm.product_id=p_product_id
supabase/migrations/20260829233000_master_reconsolidation.sql:700:    from public.products p left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
supabase/migrations/20260829233000_master_reconsolidation.sql:701:    where p.shop_id=public.assert_shop_access() and p.active=true
supabase/migrations/20260829233000_master_reconsolidation.sql:707:    where si.shop_id=public.current_shop_id() and s.status not in ('VOID','RETURNED')
supabase/migrations/20260829233000_master_reconsolidation.sql:748:  select coalesce(sum(grand_total),0),count(*) into v_revenue,v_bills from public.sales where shop_id=v_shop and status<>'VOID' and created_at::date between p_from and p_to;
supabase/migrations/20260829233000_master_reconsolidation.sql:749:  select coalesce(sum(si.quantity*coalesce(si.cost_price_snapshot,0)),0) into v_cogs from public.sale_items si join public.sales s on s.id=si.sale_id where si.shop_id=v_shop and s.status<>'VOID' and s.created_at::date between p_from and p_to;
supabase/migrations/20260829233000_master_reconsolidation.sql:750:  select coalesce(sum(amount),0) into v_expenses from public.expenses where shop_id=v_shop and status='ACTIVE' and expense_date between p_from and p_to;
supabase/migrations/20260829233000_master_reconsolidation.sql:751:  select coalesce(sum(total),0) into v_purchases from public.purchases where shop_id=v_shop and status='RECEIVED' and invoice_date between p_from and p_to;
supabase/migrations/20260829233000_master_reconsolidation.sql:752:  select coalesce(sum(total_refund),0) into v_returns from public.sale_return_requests where shop_id=v_shop and status='APPROVED' and created_at::date between p_from and p_to;
supabase/migrations/20260829233000_master_reconsolidation.sql:753:  select coalesce(sum(cash_difference),0) into v_variance from public.cashier_shifts where shop_id=v_shop and status='CLOSED' and closed_at::date between p_from and p_to;
supabase/migrations/20260829233000_master_reconsolidation.sql:754:  select count(*) into v_low from public.products p left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id where p.shop_id=v_shop and p.active=true and coalesce(i.quantity,0)<=p.minimum_stock;
supabase/migrations/20260829233000_master_reconsolidation.sql:755:  select coalesce(sum(i.quantity*p.purchase_price),0) into v_inventory from public.inventory i join public.products p on p.id=i.product_id where i.shop_id=v_shop and p.active=true;
supabase/migrations/20260829233000_master_reconsolidation.sql:769:  where si.shop_id=public.assert_shop_access() and public.current_user_role()='ADMIN' and s.status<>'VOID' and s.created_at::date between p_from and p_to
supabase/migrations/20260829233000_master_reconsolidation.sql:783:    from public.cashier_shifts where shop_id=public.assert_shop_access() and public.current_user_role()='ADMIN' and status='CLOSED' and abs(coalesce(cash_difference,0))>=200 and opened_at>=now()-(greatest(p_days,1)||' days')::interval
supabase/migrations/20260829233000_master_reconsolidation.sql:786:    from public.sale_return_requests where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and status='APPROVED' and total_refund>=500 and created_at>=now()-(greatest(p_days,1)||' days')::interval
supabase/migrations/20260829233000_master_reconsolidation.sql:789:    from public.sales where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and discount>0 and (discount>=500 or (subtotal>0 and discount/subtotal>=0.10)) and created_at>=now()-(greatest(p_days,1)||' days')::interval
supabase/migrations/20260829233000_master_reconsolidation.sql:792:    from public.stock_movements where shop_id=public.current_shop_id() and public.current_user_role()='ADMIN' and movement_type in ('DAMAGE','BROKEN','MISSING','MANUAL_ADJUSTMENT','STOCK_CORRECTION','STOCK_COUNT') and abs(quantity_change)>=5 and created_at>=now()-(greatest(p_days,1)||' days')::interval
supabase/migrations/20260829233000_master_reconsolidation.sql:812:    'Stock '||current_stock||'; suggested order '||suggested_cases||' case(s).','/inventory/intelligence','PLUS' from reorder where public.current_user_role()='ADMIN'
supabase/migrations/20260829233000_master_reconsolidation.sql:815:    'Current stock '||current_stock||'; inventory cost '||inventory_cost::text||'.','/inventory/intelligence','PLUS' from dead where public.current_user_role()='ADMIN'
supabase/migrations/20260829233000_master_reconsolidation.sql:817:  select severity,'CASH_VARIANCE','Shift variance requires review',summary,'/owner/exceptions','PLUS' from shiftx where public.current_user_role()='ADMIN'
supabase/migrations/20260829233000_master_reconsolidation.sql:824:alter table public.user_shop_memberships enable row level security;
supabase/migrations/20260829233000_master_reconsolidation.sql:832:drop policy if exists user_shop_memberships_select on public.user_shop_memberships;
supabase/migrations/20260829233000_master_reconsolidation.sql:833:create policy user_shop_memberships_select on public.user_shop_memberships for select to authenticated using(user_id=auth.uid() or public.is_platform_admin());
supabase/migrations/20260829233000_master_reconsolidation.sql:836:create policy expense_categories_select on public.expense_categories for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));
supabase/migrations/20260829233000_master_reconsolidation.sql:839:create policy expenses_select on public.expenses for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));
supabase/migrations/20260829233000_master_reconsolidation.sql:842:create policy customers_select on public.customers for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id));
supabase/migrations/20260829233000_master_reconsolidation.sql:845:create policy customer_credit_select on public.customer_credit_entries for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));
supabase/migrations/20260829233000_master_reconsolidation.sql:848:create policy compliance_profiles_select on public.compliance_profiles for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role() in ('ADMIN','MANAGER'));
supabase/migrations/20260829233000_master_reconsolidation.sql:851:create policy backup_restore_tests_select on public.backup_restore_tests for select to authenticated using(shop_id=public.current_shop_id() and public.shop_access_allowed(shop_id) and public.current_user_role()='ADMIN');
supabase/migrations/20260829233000_master_reconsolidation.sql:860:grant select on public.user_shop_memberships,public.expense_categories,public.expenses,public.customers,public.customer_credit_entries,public.compliance_profiles,public.backup_restore_tests to authenticated;
supabase/migrations/20260829233000_master_reconsolidation.sql:891:grant select(id,shop_id,sale_id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,discount,line_total,created_at) on public.sale_items to authenticated;
supabase/migrations/20260829233000_master_reconsolidation.sql:913:  shop_id uuid,
supabase/migrations/20260829233000_master_reconsolidation.sql:942:  left join public.shop_settings ss on ss.shop_id=s.id
supabase/migrations/20260829233000_master_reconsolidation.sql:988:  from public.shops s left join public.shop_settings ss on ss.shop_id=s.id where s.id=v_shop;
supabase/migrations/20260829233000_master_reconsolidation.sql:992:    shop_id,currency_code,currency_symbol,invoice_prefix,purchase_prefix,tax_enabled,tax_percentage,
supabase/migrations/20260829233000_master_reconsolidation.sql:999:  on conflict(shop_id) do update set
supabase/migrations/20260829233000_master_reconsolidation.sql:1014:  from public.shops s join public.shop_settings ss on ss.shop_id=s.id where s.id=v_shop;
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:2:-- Multi-tenant, ADMIN-only, read-only AI analytics layer.
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:6:--   * reuses user_shop_memberships; does NOT create duplicate tenant membership concepts
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:16:insert into public.user_shop_memberships(user_id,shop_id,role,active)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:17:select p.id,p.shop_id,p.role,p.active
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:19:where p.shop_id is not null
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:20:on conflict (user_id,shop_id) do update
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:21:set role=excluded.role, active=excluded.active, updated_at=now();
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:24:create index if not exists idx_user_shop_memberships_ai_access
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:25:  on public.user_shop_memberships(user_id,active,role,shop_id);
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:28:  on public.sales(shop_id,created_at desc);
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:31:  on public.sale_items(shop_id,product_id);
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:34:  on public.payments(shop_id,created_at desc,payment_type);
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:37:  on public.stock_movements(shop_id,product_id,created_at desc);
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:40:  on public.purchases(shop_id,invoice_date desc);
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:43:  on public.purchase_items(shop_id,product_id);
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:46:  on public.expenses(shop_id,expense_date desc);
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:51:  organization_id uuid not null references public.organizations(id) on delete cascade,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:52:  shop_id uuid references public.shops(id) on delete cascade,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:67:  on public.ai_activity_logs(organization_id,created_at desc);
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:83:-- Returns only ADMIN memberships belonging to the authenticated user.
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:86:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:90:  shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:92:  organization_id uuid
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:107:  if p_anchor_shop_id is null then
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:115:  select s.organization_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:117:  from public.user_shop_memberships m
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:118:  join public.shops s on s.id=m.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:119:  join public.organizations o on o.id=s.organization_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:121:    and m.shop_id=p_anchor_shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:123:    and m.role='ADMIN'
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:125:    and s.access_enabled=true
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:126:    and s.subscription_status in ('TRIAL','ACTIVE')
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:136:    select s.id,s.name,s.organization_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:138:    where s.id=p_anchor_shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:139:      and s.organization_id=v_org;
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:144:  select s.id,s.name,s.organization_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:145:  from public.user_shop_memberships m
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:146:  join public.shops s on s.id=m.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:147:  join public.organizations o on o.id=s.organization_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:150:    and m.role='ADMIN'
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:151:    and s.organization_id=v_org
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:153:    and s.access_enabled=true
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:154:    and s.subscription_status in ('TRIAL','ACTIVE')
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:162:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:176:    select * from public.ai_scope_shops(p_anchor_shop_id,v_scope)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:180:    'organization_id',(select organization_id from scoped limit 1),
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:181:    'anchor_shop_id',p_anchor_shop_id,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:183:    'role','ADMIN',
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:187:      jsonb_agg(jsonb_build_object('shop_id',shop_id,'shop_name',shop_name) order by shop_name),
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:204:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:215:  perform 1 from public.ai_scope_shops(p_anchor_shop_id,p_scope) limit 1;
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:235:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:257:  v_context:=public.ai_resolve_context(p_anchor_shop_id,p_scope);
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:258:  v_org:=(v_context->>'organization_id')::uuid;
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:259:  v_log_shop:=case when upper(coalesce(p_scope,'SHOP'))='SHOP' then p_anchor_shop_id else null end;
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:262:    organization_id,shop_id,user_id,request_id,question_category,tools_called,status,latency_ms
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:309:-- The model never controls p_anchor_shop_id or p_scope.
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:314:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:332:    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:337:    join scope sc on sc.shop_id=s.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:348:    join scope sc on sc.shop_id=r.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:355:    join scope sc on sc.shop_id=p.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:376:    select sc.shop_id,sc.shop_name,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:380:    left join sales_base s on s.shop_id=sc.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:381:    group by sc.shop_id,sc.shop_name
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:404:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:422:    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:427:    join scope sc on sc.shop_id=s.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:442:    join scope sc on sc.shop_id=e.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:446:    select sc.shop_id,sc.shop_name,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:447:      coalesce((select round(sum(s.grand_total),2) from sales_base s where s.shop_id=sc.shop_id),0) revenue,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:451:                where si.shop_id=sc.shop_id),0) cogs,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:454:                where e.shop_id=sc.shop_id and e.status='ACTIVE' and e.expense_date between v_from and v_to),0) expenses
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:470:          'shop_id',x.shop_id,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:492:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:509:    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:512:    select si.shop_id,si.product_id,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:517:    join scope sc on sc.shop_id=si.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:519:    group by si.shop_id,si.product_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:522:    select sc.shop_name,p.shop_id,p.id product_id,p.product_name,p.minimum_stock,p.units_per_case,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:528:    join public.products p on p.shop_id=sc.shop_id and p.active=true
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:529:    left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:530:    left join sold so on so.shop_id=p.shop_id and so.product_id=p.id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:585:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:602:    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:605:    select si.shop_id,si.product_id,coalesce(sum(si.quantity),0)::integer units
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:608:    join scope sc on sc.shop_id=si.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:611:    group by si.shop_id,si.product_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:614:    select sc.shop_name,p.shop_id,p.id product_id,p.barcode,p.product_name,p.minimum_stock,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:620:    join public.products p on p.shop_id=sc.shop_id and p.active=true
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:621:    left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:622:    left join sold so on so.shop_id=p.shop_id and so.product_id=p.id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:657:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:674:    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:677:    select sc.shop_name,pi.shop_id,pi.product_id,p.product_name,p.barcode,p.sku,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:680:      row_number() over(partition by pi.shop_id,pi.product_id order by pu.invoice_date desc,pu.created_at desc,pi.id desc) rn
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:684:    join scope sc on sc.shop_id=pi.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:695:    select shop_name,shop_id,product_id,max(product_name) product_name,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:701:    group by shop_name,shop_id,product_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:732:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:753:    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:756:    select sc.shop_name,p.shop_id,p.id product_id,p.product_name,p.barcode,p.sku,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:759:    join public.products p on p.shop_id=sc.shop_id and p.active=true
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:760:    left join public.inventory i on i.shop_id=p.shop_id and i.product_id=p.id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:773:    join public.stock_movements sm on sm.shop_id=m.shop_id and sm.product_id=m.product_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:792:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:807:    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:819:    join scope sc on sc.shop_id=sh.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:845:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:860:    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:870:    join scope sc on sc.shop_id=sh.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:884:    join scope sc on sc.shop_id=r.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:898:    join scope sc on sc.shop_id=s.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:926:  p_anchor_shop_id uuid,
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:944:    select * from public.ai_scope_shops(p_anchor_shop_id,p_scope)
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:947:    select sc.shop_name,e.shop_id,ec.name category,e.amount,e.payment_method,e.expense_date
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:950:    join scope sc on sc.shop_id=e.shop_id
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:960:    select shop_id,shop_name,round(sum(amount),2) amount,count(*)::integer entries
supabase/migrations/20260830070000_ai_owner_assistant_v1.sql:962:    group by shop_id,shop_name
```
