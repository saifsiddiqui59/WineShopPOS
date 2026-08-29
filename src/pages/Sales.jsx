import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Sales() {
  const { sales } = useShop();
  const { profile } = useAuth();

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Sales</h2>
          <p>{profile?.role === "CASHIER" ? "Your sales" : "Shop sales"} stored in Supabase</p>
        </div>
      </div>

      <div className="panel data-table-wrapper">
        <table className="data-table">
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
        </table>
      </div>
    </div>
  );
}
