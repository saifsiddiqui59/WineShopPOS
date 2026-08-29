import { RotateCcw } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function Settings() {
  const { resetDemo } = useShop();

  function handleReset() {
    const confirmed = window.confirm(
      "Reset inventory and delete all local demo sales?"
    );

    if (confirmed) {
      resetDemo();
      window.alert("Demo data has been reset.");
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Settings</h2>
          <p>Prototype application settings</p>
        </div>
      </div>

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
          </div>
        </section>

        <section className="panel danger-zone">
          <h3>Demo Data</h3>
          <p>
            Reset all inventory quantities back to opening stock and remove
            local sales.
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
