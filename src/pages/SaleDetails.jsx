import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { supabase } from "../lib/supabase";
import Receipt80mm from "../components/Receipt80mm";

function normalizeSale(row, items = [], payments = []) {
  const payment = payments.find((entry) => entry.payment_type !== "REFUND") || payments[0] || null;
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    createdAt: row.created_at,
    cashierId: row.cashier_id,
    status: row.status,
    paymentMethod: payment?.payment_method || "",
    paymentReference: payment?.reference_number || "",
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    grandTotal: Number(row.grand_total || 0),
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name_snapshot || "Product",
      barcode: item.barcode_snapshot || "",
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.unit_price || 0),
      lineTotal: Number(item.line_total || 0),
      purchasePrice: Number(item.fifo_unit_cost || 0),
      fifoLineCost: Number(item.fifo_line_cost || 0),
    })),
  };
}

async function loadSaleReceipt(saleId) {
  const header = await supabase
    .from("sales")
    .select("id,invoice_number,subtotal,discount,grand_total,cashier_id,status,created_at")
    .eq("id", saleId)
    .single();

  if (header.error || !header.data) {
    throw header.error || new Error("Completed sale was not found.");
  }

  const [items, payments] = await Promise.all([
    supabase
      .from("sale_items")
      .select("id,sale_id,product_id,product_name_snapshot,barcode_snapshot,quantity,unit_price,line_total,fifo_unit_cost,fifo_line_cost")
      .eq("sale_id", saleId),
    supabase
      .from("payments")
      .select("id,sale_id,payment_method,amount,reference_number,payment_type,created_at")
      .eq("sale_id", saleId),
  ]);

  if (items.error) throw new Error(`Receipt items could not be loaded: ${items.error.message}`);
  if (payments.error) throw new Error(`Payment details could not be loaded: ${payments.error.message}`);

  return normalizeSale(header.data, items.data || [], payments.data || []);
}

export default function SaleDetails() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { sales, loadingData } = useShop();
  const cached = sales.find((sale) => sale.id === id);
  const [remote, setRemote] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(!cached);
  const [error, setError] = useState("");
  const printed = useRef(false);
  const sale = cached || remote;
  const printRequested = params.get("print") === "1";

  useEffect(() => {
    if (!id || cached) {
      setRemoteLoading(false);
      return undefined;
    }
    let cancelled = false;
    setRemoteLoading(true);
    setError("");
    loadSaleReceipt(id)
      .then((loaded) => { if (!cancelled) setRemote(loaded); })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError?.message || "Completed sale could not be loaded.");
          setRemote(null);
        }
      })
      .finally(() => { if (!cancelled) setRemoteLoading(false); });
    return () => { cancelled = true; };
  }, [id, cached]);

  useEffect(() => {
    if (!sale || !printRequested || printed.current) return undefined;
    printed.current = true;
    const timer = window.setTimeout(() => window.print(), 700);
    return () => window.clearTimeout(timer);
  }, [sale, printRequested]);

  if (!sale && (loadingData || remoteLoading)) {
    return <div className="panel">Loading completed sale and receipt...</div>;
  }

  if (!sale) {
    return (
      <div className="panel">
        <h2>Receipt unavailable</h2>
        <p>{error || "Sale was not found for this shop."}</p>
        <Link className="secondary-button" to="/pos/sales">Back to Sales</Link>
      </div>
    );
  }

  return (
    <div className="invoice-page">
      <div className="page-heading no-print">
        <div>
          <h2>Invoice {sale.invoiceNumber}</h2>
          <p>80mm thermal receipt layout{printRequested ? " · Print dialog opens automatically" : ""}</p>
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
