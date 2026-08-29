import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Users() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "CASHIER",
  });

  const isAdmin = profile?.role === "ADMIN";

  async function callFunction(body) {
    const { data, error } = await supabase.functions.invoke(
      "manage-shop-users",
      { body }
    );

    if (error) throw error;
    if (!data?.ok) throw new Error(data?.message || "Operation failed");
    return data;
  }

  async function loadUsers() {
    if (!isAdmin) return;

    try {
      const data = await callFunction({ action: "list" });
      setUsers(data.users || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [isAdmin]);

  async function createUser(event) {
    event.preventDefault();
    setMessage("");

    try {
      await callFunction({
        action: "create",
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      setForm({
        fullName: "",
        email: "",
        password: "",
        role: "CASHIER",
      });

      setMessage("User created successfully.");
      await loadUsers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function setActive(userId, active) {
    try {
      await callFunction({ action: "set_active", userId, active });
      await loadUsers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (!isAdmin) {
    return (
      <div className="panel">
        <h2>Users</h2>
        <p>Only the shop ADMIN can manage users.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Users & Roles</h2>
          <p>Shop Admin can create Manager and Cashier accounts.</p>
        </div>
      </div>

      {message && <div className="purchase-message success">{message}</div>}

      <div className="settings-grid">
        <form className="panel" onSubmit={createUser}>
          <h3>Create Shop User</h3>

          <div className="settings-fields">
            <label>
              Full Name
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>

            <label>
              Temporary Password
              <input
                type="password"
                required
                minLength="8"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>

            <label>
              Role
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="CASHIER">Cashier</option>
                <option value="MANAGER">Manager</option>
              </select>
            </label>
          </div>

          <br />
          <button className="primary-button">Create User</button>
        </form>

        <section className="panel">
          <h3>Role Liberty</h3>
          <p><strong>ADMIN:</strong> users, products, purchases, inventory, reports, POS.</p>
          <p><strong>MANAGER:</strong> products, purchases, inventory adjustments, reports, POS.</p>
          <p><strong>CASHIER:</strong> POS and permitted sales views only.</p>
          <p><strong>PLATFORM OWNER:</strong> not a shop role. Controls shop ADMIN + subscription kill switch.</p>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 18 }}>
        <h3>Shop Users</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>{item.full_name}</td>
                  <td>{item.email || "-"}</td>
                  <td>{item.role}</td>
                  <td>{item.active ? "ACTIVE" : "INACTIVE"}</td>
                  <td>
                    {item.role === "ADMIN" ? (
                      <span>Platform controlled</span>
                    ) : (
                      <button
                        className="secondary-button"
                        onClick={() => setActive(item.id, !item.active)}
                      >
                        {item.active ? "Disable" : "Enable"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
