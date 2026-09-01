import SortableTable from "../components/ui/SortableTable";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Sales() {
  const { sales, refreshAll, loadingData, dataError } = useShop();
  const { profile } = useAuth();

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Sales</h2>
          <p>{profile?.role === "CASHIER" ? "Your sales" : "Shop sales"} stored in Supabase</p>
        </div>
        <button type="button" className="secondary-button" disabled={loadingData} onClick={() => void refreshAll()}>
          {loadingData ? "Refreshing..." : "Refresh Sales"}
        </button>
      </div>

      {dataError ? (
        <div className="purchase-message" style={{ marginBottom: 12 }}>
          Data refresh notice: {dataError}
        </div>
      ) : null}

      {!loadingData && sales.length === 0 ? (
        <div className="purchase-message" style={{ marginBottom: 12 }}>
          No Sales rows are loaded in this browser. Do not repeat a completed checkout just to make this list appear. Use Refresh Sales and review the data notice above.
        </div>
      ) : null}

      <div className="panel data-table-wrapper">
        <SortableTable className="data-table">
          <thead><tr><th>Invoice</th><th>Date</th><th>Items</th><th>Payment</th><th>Discount</th><th>Total</th><th></th></tr></thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.invoiceNumber}</td>
                <td>{new Date(sale.createdAt).toLocaleString("en-IN")}</td>
                <td>{sale.items.reduce((sum,i) => sum + i.quantity, 0)}</td>
                <td>{sale.paymentMethod}</td>
                <td>{money.format(sale.discount)}</td>
                <td>{money.format(sale.grandTotal)}</td>
                <td><Link to={`/sales/${sale.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </div>
    </div>
  );
}
