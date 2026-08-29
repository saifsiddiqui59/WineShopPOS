import { Navigate, useParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function SaleDetails() {
  const { id } = useParams();
  const { sales, loadingData } = useShop();
  const sale = sales.find((item) => item.id === id);

  if (loadingData) return <div className="panel">Loading...</div>;
  if (!sale) return <Navigate to="/sales" replace />;

  return (
    <div className="invoice-page">
      <div className="page-heading no-print">
        <div><h2>Invoice {sale.invoiceNumber}</h2></div>
        <button className="primary-button" onClick={() => window.print()}>Print</button>
      </div>

      <div className="panel invoice-card">
        <h2>WineShop POS</h2>
        <p>{sale.invoiceNumber}</p>
        <p>{new Date(sale.createdAt).toLocaleString("en-IN")}</p>

        <table className="data-table">
          <thead><tr><th>Product</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id || item.productId}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{money.format(item.unitPrice)}</td>
                <td>{money.format(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>Subtotal: {money.format(sale.subtotal)}</p>
        <p>Discount: {money.format(sale.discount)}</p>
        <h2>Total: {money.format(sale.grandTotal)}</h2>
        <p>Payment: {sale.paymentMethod} {sale.paymentReference ? `· ${sale.paymentReference}` : ""}</p>
      </div>
    </div>
  );
}
