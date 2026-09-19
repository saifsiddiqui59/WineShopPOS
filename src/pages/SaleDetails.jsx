import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Receipt80mm from "../components/Receipt80mm";
import { loadAuthoritativeReceipt } from "../lib/receipt";

export default function SaleDetails() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    setLoading(true);
    setError("");

    loadAuthoritativeReceipt(id)
      .then((loaded) => {
        if (!cancelled) setSale(loaded);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError?.message || "Completed sale could not be loaded.");
          setSale(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div className="panel">Loading authoritative sale receipt...</div>;
  }

  if (!sale) {
    return (
      <div className="panel">
        <h2>Receipt unavailable</h2>
        <p>{error || "Sale was not found for this shop."}</p>
        <p><strong>Do not repeat payment just because a receipt cannot be loaded.</strong></p>
        <Link className="secondary-button" to="/pos/sales">Back to Sales</Link>
      </div>
    );
  }

  return (
    <div className="invoice-page">
      <div className="page-heading no-print">
        <div>
          <h2>Invoice {sale.invoiceNumber}</h2>
          <p>Authoritative 80mm receipt · printing never changes sale status</p>
        </div>
        <div className="button-row">
          <Link className="secondary-button" to="/pos/sales">Sales</Link>
          <button className="primary-button" onClick={() => window.print()}>Print Receipt</button>
        </div>
      </div>
      <Receipt80mm sale={sale}/>
    </div>
  );
}
