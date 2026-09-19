import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function Receipt80mm({ sale }) {
  const { profile } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    supabase
      .from("shop_settings")
      .select("store_address,store_phone,tax_registration_number,receipt_footer,printer_paper_mm")
      .maybeSingle()
      .then(({ data }) => setSettings(data || null));
  }, []);

  const tenders = sale?.tenders || [];

  return (
    <section className={`thermal-receipt paper-${settings?.printer_paper_mm || 80}`}>
      <header>
        <h2>{profile?.shop_name || "Wine Shop"}</h2>
        {settings?.store_address && <p>{settings.store_address}</p>}
        {settings?.store_phone && <p>Phone: {settings.store_phone}</p>}
        {settings?.tax_registration_number && <p>Reg: {settings.tax_registration_number}</p>}
      </header>

      <div className="receipt-meta">
        <p>Invoice: {sale.invoiceNumber}</p>
        <p>{new Date(sale.createdAt).toLocaleString("en-IN")}</p>
        <p>Cashier: {profile?.full_name || "-"}</p>
        {sale.status && sale.status !== "COMPLETED" ? (
          <p><strong>Status: {String(sale.status).replaceAll("_", " ")}</strong></p>
        ) : null}
      </div>

      <div className="receipt-rule" />

      {sale.items.map((item) => (
        <div className="receipt-item" key={item.id || item.productId}>
          <strong>{item.productName}</strong>
          <div>
            <span>{item.quantity} × {money.format(item.unitPrice)}</span>
            <span>{money.format(item.lineTotal)}</span>
          </div>
        </div>
      ))}

      <div className="receipt-rule" />
      <div className="receipt-total"><span>Subtotal</span><span>{money.format(sale.subtotal)}</span></div>
      <div className="receipt-total"><span>Discount</span><span>{money.format(sale.discount)}</span></div>
      <div className="receipt-total grand"><span>TOTAL</span><span>{money.format(sale.grandTotal)}</span></div>

      {tenders.length ? (
        <>
          <div className="receipt-rule" />
          {tenders.map((entry, index) => (
            <div className="receipt-total" key={`${entry.type}-${index}`}>
              <span>{String(entry.type).replaceAll("_", " ")}</span>
              <span>{money.format(entry.amount)}</span>
            </div>
          ))}
        </>
      ) : (
        <p>Payment: {sale.paymentMethod}{sale.paymentReference ? ` · ${sale.paymentReference}` : ""}</p>
      )}

      {Number(sale.approvedReturnTotal || 0) > 0 ? (
        <p><strong>Approved returns after invoice: {money.format(sale.approvedReturnTotal)}</strong></p>
      ) : null}

      <footer>{settings?.receipt_footer || "THANK YOU"}</footer>
    </section>
  );
}
