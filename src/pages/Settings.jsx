import { Download, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useShop } from "../context/ShopContext";

export default function Settings() {
  const {
    products,
    sales,
    purchases,
    createBackup,
    importBackup,
    resetDemo,
  } = useShop();

  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");

  function handleExport() {
    const backup = createBackup();

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download =
      `WineShopPOS-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    setMessage("Backup exported successfully.");
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      const confirmed = window.confirm(
        "Importing a backup will replace current local products, inventory, sales and purchases. Continue?"
      );

      if (!confirmed) {
        event.target.value = "";
        return;
      }

      const result = importBackup(backup);

      if (!result.ok) {
        window.alert(result.message);
      } else {
        setMessage(result.message);
      }
    } catch {
      window.alert("The selected file is not valid JSON.");
    }

    event.target.value = "";
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset products to seed data, restore opening inventory and delete all local sales and purchases?"
    );

    if (confirmed) {
      resetDemo();
      setMessage("Demo data has been reset.");
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Settings & Backup</h2>
          <p>Local MVP configuration and browser data backup</p>
        </div>
      </div>

      {message && (
        <div className="purchase-message success">
          {message}
        </div>
      )}

      <div className="settings-grid">
        <section className="panel">
          <h3>Store Information</h3>

          <div className="settings-fields">
            <label>
              Store Name
              <input value="Demo Wine Shop" readOnly />
            </label>

            <label>
              Currency
              <input value="INR (₹)" readOnly />
            </label>

            <label>
              Data Mode
              <input value="Browser LocalStorage" readOnly />
            </label>

            <label>
              Current Local Data
              <input
                value={
                  `${products.length} products · ` +
                  `${sales.length} sales · ` +
                  `${purchases.length} purchases`
                }
                readOnly
              />
            </label>
          </div>
        </section>

        <section className="panel backup-panel">
          <h3>Backup & Restore</h3>

          <p>
            Export the entire local MVP data set to JSON or restore it later.
          </p>

          <div className="backup-actions">
            <button
              className="primary-button backup-action-button"
              onClick={handleExport}
            >
              <Download size={18} />
              Export JSON Backup
            </button>

            <button
              className="secondary-button backup-action-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} />
              Import JSON Backup
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={handleImport}
            />
          </div>

          <div className="backup-note">
            Backup contains products, inventory, sales and purchase history.
          </div>
        </section>

        <section className="panel danger-zone settings-full-width">
          <h3>Reset Demo</h3>

          <p>
            Restore the original dummy product list and opening inventory, then
            remove all local sales and purchase history.
          </p>

          <button className="danger-button" onClick={handleReset}>
            <RotateCcw size={18} />
            Reset Demo Data
          </button>
        </section>
      </div>
    </div>
  );
}
