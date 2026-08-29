import { Eye, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Sales() {
  const { sales } = useShop();

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Sales History</h2>
          <p>{sales.length} completed transaction(s)</p>
        </div>
      </div>

      <div className="panel">
        {sales.length === 0 ? (
          <div className="large-empty-state">
            <ReceiptText size={48} />
            <h3>No sales yet</h3>
            <p>Complete a transaction from POS Billing.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <strong>{sale.invoiceNumber}</strong>
                    </td>

                    <td>
                      {new Date(sale.createdAt).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {sale.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}
                    </td>

                    <td>
                      <span className="category-badge">
                        {sale.paymentMethod}
                      </span>
                    </td>

                    <td>{money.format(Number(sale.discount ?? 0))}</td>

                    <td>
                      <strong>{money.format(sale.grandTotal)}</strong>
                    </td>

                    <td>
                      <Link
                        className="edit-product-link"
                        to={`/sales/${sale.id}`}
                      >
                        <Eye size={15} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
