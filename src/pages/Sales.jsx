import SortableTable from "../components/ui/SortableTable";
import StatusBadge from "../components/ui/StatusBadge";
import PeriodSelector from "../components/ui/PeriodSelector";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { indiaPeriodLabel, indiaPeriodRange } from "../lib/businessDate";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const PAGE_SIZE = 500;

async function fetchPeriodSales(from, to) {
  const rows = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.rpc("sales_period_page_v1", {
      p_from: from,
      p_to: to,
      p_offset: offset,
      p_limit: PAGE_SIZE,
    });
    if (error) throw error;

    const batch = data || [];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) return rows;

    offset += PAGE_SIZE;
    if (offset > 200000) throw new Error("Sales period exceeded the safety limit.");
  }
}

export default function Sales() {
  const { profile } = useAuth();
  const [period, setPeriod] = useState(() => ({
    preset: "TODAY",
    ...indiaPeriodRange("TODAY"),
  }));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const requestSeq = useRef(0);

  const load = useCallback(async () => {
    if (!period.from || !period.to || period.to < period.from) {
      setMessage("Choose a valid sales date range.");
      return;
    }

    const seq = ++requestSeq.current;
    setLoading(true);
    setMessage("");

    try {
      const next = await fetchPeriodSales(period.from, period.to);
      if (seq !== requestSeq.current) return;
      setRows(next);
    } catch (error) {
      if (seq === requestSeq.current) {
        setRows([]);
        setMessage(error?.message || "Unable to load selected-period sales.");
      }
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [period.from, period.to]);

  useEffect(() => {
    void load();
  }, [load]);

  function choosePreset(nextPreset) {
    setPeriod((current) => ({
      preset: nextPreset,
      ...indiaPeriodRange(nextPreset, current),
    }));
  }

  function changeCustom(key, value) {
    setPeriod((current) => ({
      ...current,
      preset: "CUSTOM",
      [key]: value,
    }));
  }

  const label = indiaPeriodLabel(period.preset, period.from, period.to);
  const scope = profile?.role === "CASHIER" ? "Your sales" : "Shop sales";

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Sales</h2>
          <p>{scope} · {label} · server-side India business-date history.</p>
        </div>
      </div>

      <PeriodSelector
        preset={period.preset}
        from={period.from}
        to={period.to}
        onPresetChange={choosePreset}
        onFromChange={(value) => changeCustom("from", value)}
        onToChange={(value) => changeCustom("to", value)}
        loading={loading}
        onRefresh={load}
      />

      {message ? (
        <div className="purchase-message" style={{ marginBottom: 12 }}>
          {message}
        </div>
      ) : null}

      {!loading && !message && rows.length === 0 ? (
        <div className="purchase-message" style={{ marginBottom: 12 }}>
          No sales found for {label}. A completed checkout should never be repeated just to make this list appear.
        </div>
      ) : null}

      <div className="panel data-table-wrapper">
        <SortableTable className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Business Date</th>
              <th>Time</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Discount</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.invoice_number}</td>
                <td>{sale.business_date}</td>
                <td>{new Date(sale.created_at).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</td>
                <td>{Number(sale.item_count || 0)}</td>
                <td>{sale.payment_method || "-"}</td>
                <td><StatusBadge status={sale.status || "COMPLETED"} /></td>
                <td>{money.format(sale.discount || 0)}</td>
                <td>{money.format(sale.grand_total || 0)}</td>
                <td><Link to={`/sales/${sale.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </div>
    </div>
  );
}
