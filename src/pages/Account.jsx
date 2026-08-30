import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import UserAvatar from "../components/ui/UserAvatar";
import StatusBadge from "../components/ui/StatusBadge";
import { APP_VERSION } from "../config/featureCatalog";
import { notifyThemePreference } from "../lib/theme";

export default function Account() {
  const { profile, user, refreshAccess } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  const [form, setForm] = useState({ fullName: "", phone: "", avatarUrl: "", theme: "SYSTEM" });
  const [password, setPassword] = useState({ next: "", confirm: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setForm({ fullName: profile?.full_name || "", phone: profile?.phone || "", avatarUrl: profile?.avatar_url || "", theme: profile?.theme || "SYSTEM" }), [profile]);
  const lastLogin = useMemo(() => user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString("en-IN") : "Not available", [user]);

  async function saveProfile(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.rpc("update_my_profile", { p_full_name: form.fullName, p_phone: form.phone || null, p_avatar_url: form.avatarUrl || null, p_theme: form.theme });
    if (error) setMessage("Unable to update profile. Check the entered values and try again.");
    else { setMessage("Profile updated."); await refreshAccess(); }
    setBusy(false);
  }

  async function changePassword(event) {
    event.preventDefault(); setMessage("");
    if (password.next.length < 8) return setMessage("Use a password with at least 8 characters.");
    if (password.next !== password.confirm) return setMessage("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: password.next });
    setMessage(error ? "Unable to change password. Please retry." : "Password changed successfully.");
    if (!error) setPassword({ next: "", confirm: "" });
    setBusy(false);
  }

  return <div><PageHeader title="My Account" subtitle="Profile, preferences and security for your signed-in account."/>
    <nav className="module-tabs account-tabs">
      {[['profile','My Profile'],['settings','Account Settings'],['security','Security'],['about','Help / About']].map(([key,label]) => <button key={key} className={tab===key ? "module-tab active" : "module-tab"} onClick={() => setParams({ tab:key })}>{label}</button>)}
    </nav>
    {message ? <div className="purchase-message">{message}</div> : null}

    {tab === "profile" ? <div className="settings-grid"><section className="panel profile-summary-card"><UserAvatar profile={profile} size="xl"/><div><h3>{profile?.full_name}</h3><p>{profile?.email || user?.email}</p><StatusBadge status={profile?.role}/><p><strong>Shop:</strong> {profile?.shop_name}</p><p><strong>Organization:</strong> {profile?.organization_name || "-"}</p><p><strong>Account:</strong> {profile?.active ? "Active" : "Inactive"}</p><p><strong>Last login:</strong> {lastLogin}</p></div></section>
      <form className="panel" onSubmit={saveProfile}><h3>Editable profile</h3><div className="settings-fields"><label>Display Name<input required value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})}/></label><label>Phone<input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></label><label>Profile Image URL<input type="url" value={form.avatarUrl} onChange={(e)=>setForm({...form,avatarUrl:e.target.value})} placeholder="https://..."/></label></div><p className="muted-text">Email, role and shop security assignments cannot be changed here.</p><button className="primary-button" disabled={busy}>{busy?"Saving...":"Save Profile"}</button></form></div> : null}

    {tab === "settings" ? <form className="panel compact-form" onSubmit={saveProfile}><h3>UI Preferences</h3><label>Theme<select value={form.theme} onChange={(e)=>{ const theme=e.target.value; setForm({...form,theme}); notifyThemePreference(theme); }}><option value="SYSTEM">System</option><option value="LIGHT">Light</option><option value="DARK">Dark</option></select></label><p className="muted-text">Theme changes preview immediately and are saved to your account. System follows your device light/dark preference.</p><button className="primary-button" disabled={busy}>Save Preferences</button></form> : null}

    {tab === "security" ? <form className="panel compact-form" onSubmit={changePassword}><h3>Change Password</h3><label>New Password<input type="password" minLength="8" value={password.next} onChange={(e)=>setPassword({...password,next:e.target.value})} required/></label><label>Confirm Password<input type="password" minLength="8" value={password.confirm} onChange={(e)=>setPassword({...password,confirm:e.target.value})} required/></label><button className="primary-button" disabled={busy}>Change Password</button><p className="muted-text">Role changes remain Admin/Platform-controlled. Never share passwords or service keys.</p></form> : null}

    {tab === "about" ? <section className="panel"><h3>WineShopPOS</h3><p><strong>Version:</strong> {APP_VERSION}</p><p className="about-faith-line"><strong>Trust the GOD.</strong></p><p><strong>Created by:</strong> Almighty sa_f</p><p><strong>Support:</strong> Contact your WineShopPOS software provider for account, subscription or database support.</p><p><strong>Documentation:</strong> Project developer handbook and user manual are stored in the Git repository under <code>docs/</code>.</p></section> : null}
  </div>;
}
