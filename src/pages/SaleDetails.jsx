import { ArrowLeft, Printer, ReceiptText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function SaleDetails() {
  const { id } = useParams();
  const { sales } = useShop();

  const sale = sales.find((item) => item.id === id);

  if (!sale) {
    return (
      <div className="panel">
        <h3>Sale not found</h3>
        <Link to="/sales">Return to Sales</Link>
      </div>
    );
  }

  return (
    <div className="sale-detail-page">
      <div className="page-heading no-print">
        <div>
          <Link className="back-link" to="/sales">
            <ArrowLeft size={16} />
            Sales
          </Link>

          <h2>Invoice Details</h2>
          <p>{sale.invoiceNumber}</p>
        </div>

        <button
          className="secondary-button print-button"
          onClick={() => window.print()}
        >
          <Printer size={17} />
          Print Preview
        </button>
      </div>

      <section className="invoice-card">
        <div className="invoice-header">
          <div>
            <ReceiptText size={30} />
            <h2>WineShop POS</h2>
            <p>Development Receipt</p>
          </div>

          <div className="invoice-meta">
            <strong>{sale.invoiceNumber}</strong>
            <span>
              {new Date(sale.createdAt).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="invoice-info-grid">
          <div>
            <span>Payment Method</span>
            <strong>{sale.paymentMethod}</strong>
          </div>

          <div>
            <span>Payment Reference</span>
            <strong>{sale.paymentReference || "—"}</strong>
          </div>

          <div>
            <span>Total Items</span>
            <strong>
              {sale.items.reduce(
                (total, item) => total + item.quantity,
                0
              )}
            </strong>
          </div>
        </div>

        <div className="invoice-table-wrapper">
          <table className="data-table invoice-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {sale.items.map((item) => (
                <tr key={`${sale.id}-${item.productId}`}>
                  <td>
                    <strong>{item.productName}</strong>
                    <div className="invoice-barcode">{item.barcode}</div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{money.format(item.unitPrice)}</td>
                  <td>{money.format(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-totals">
          <div>
            <span>Subtotal</span>
            <strong>{money.format(sale.subtotal)}</strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>{money.format(Number(sale.discount ?? 0))}</strong>
          </div>

          <div className="invoice-grand-total">
            <span>Grand Total</span>
            <strong>{money.format(sale.grandTotal)}</strong>
          </div>
        </div>

        <div className="invoice-footer">
          Dummy development receipt. Tax/excise/receipt compliance will be
          configured in later production chapters.
        </div>
      </section>
    </div>
  );
}
