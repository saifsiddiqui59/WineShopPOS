import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import PeriodSelector from "../components/ui/PeriodSelector";
import { DonutChartCard, HorizontalBarChartCard, LineChartCard } from "../components/charts/BusinessCharts";
import { indiaPeriodLabel, indiaPeriodRange } from "../lib/businessDate";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const dayLabel = (date) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

export default function OwnerCenter() {
  const { profile } = useAuth();
  const [period, setPeriod] = useState(() => ({
    preset: "TODAY",
    ...indiaPeriodRange("TODAY"),
  }));
  const [summary, setSummary] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [summaryMessage, setSummaryMessage] = useState("");
  const [intelligenceMessage, setIntelligenceMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const summarySeq = useRef(0);

  const loadSummary = useCallback(async () => {
    if (!period.from || !period.to || period.to < period.from) {
      setSummaryMessage("Choose a valid owner period.");
      return;
    }

    const seq = ++summarySeq.current;
    setLoading(true);
    setSummaryMessage("");

    try {
      const { data, error } = await supabase.rpc("owner_center_summary", {
        p_from: period.from,
        p_to: period.to,
      });
      if (seq !== summarySeq.current) return;
      if (error) throw error;

      const next = data || {};
      setSummary(next);

      if (Math.abs(Number(next.payment_gap || 0)) > 0.01) {
        setSummaryMessage(
          `Financial reconciliation requires review: payment mix gap ${money.format(next.payment_gap)}.`,
        );
      }
    } catch (error) {
      if (seq === summarySeq.current) {
        setSummary({});
        setSummaryMessage(error?.message || "Unable to load Owner Center period performance.");
      }
    } finally {
      if (seq === summarySeq.current) setLoading(false);
    }
  }, [period.from, period.to]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    let cancelled = false;

    async function loadIntelligence() {
      const [r, e] = await Promise.all([
        supabase.rpc("owner_recommendations", { p_history_days: 30 }),
        supabase.rpc("loss_control_exceptions_v3", { p_days: 30 }),
      ]);

      if (cancelled) return;

      if (r.error || e.error) {
        setIntelligenceMessage("Unable to load all 30-day Owner intelligence.");
      } else {
        setIntelligenceMessage("");
      }

      setRecommendations(r.data || []);
      setExceptions(e.data || []);
    }

    void loadIntelligence();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const chartData = useMemo(() => ({
    trend: (summary.trend || []).map((row) => ({
      label: dayLabel(row.date),
      value: Number(row.value || 0),
    })),
    payments: (summary.payment_mix || [])
      .map((row) => ({
        label: String(row.label || "OTHER").replaceAll("_", " "),
        value: Number(row.value || 0),
      }))
      .filter((row) => row.value !== 0),
    topProducts: (summary.top_products || []).map((row) => ({
      label: row.label || "Product",
      value: Number(row.value || 0),
    })),
  }), [summary]);

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Owner Control Center"
        subtitle={`Period performance + current state + 30-day intelligence · ${profile?.shop_name || "Current Shop"}`}
        tier="PRO"
      />

      <PeriodSelector
        preset={period.preset}
        from={period.from}
        to={period.to}
        onPresetChange={choosePreset}
        onFromChange={(value) => changeCustom("from", value)}
        onToChange={(value) => changeCustom("to", value)}
        loading={loading}
        onRefresh={loadSummary}
      />

      {summaryMessage ? <div className="purchase-message">{summaryMessage}</div> : null}
      {intelligenceMessage ? <div className="purchase-message">{intelligenceMessage}</div> : null}

      <div className="metric-grid four executive-metrics">
        <div className="metric-card metric-accent-blue">
          <span>Net Revenue · {label}</span>
          <strong>{money.format(summary.revenue || 0)}</strong>
          <small>{summary.bills || 0} bills · {money.format(summary.returns || 0)} approved returns</small>
        </div>
        <div className="metric-card metric-accent-indigo">
          <span>Gross Profit · {label}</span>
          <strong>{money.format(summary.gross_profit || 0)}</strong>
          <small>After FIFO Cost of Goods Sold</small>
        </div>
        <div className="metric-card metric-accent-green">
          <span>Operating Profit · {label}</span>
          <strong>{money.format(summary.operating_profit || 0)}</strong>
          <small>After operating expenses</small>
        </div>
        <div className="metric-card metric-accent-orange">
          <span>Current Inventory Cost</span>
          <strong>{money.format(summary.inventory_cost || 0)}</strong>
          <small>Current state · not historical as-of value</small>
        </div>
      </div>

      <div className="dashboard-chart-grid primary" style={{ marginTop: 16 }}>
        <LineChartCard
          title={`${label} Sales Trend`}
          subtitle="Daily net sales after approved returns"
          data={chartData.trend}
          formatValue={(value) => money.format(value)}
        />
        <DonutChartCard
          title={`Payment Mix · ${label}`}
          subtitle="All tenders after approved refunds"
          data={chartData.payments}
          formatValue={(value) => money.format(value)}
          centerLabel="Net Sales"
        />
      </div>

      <div className="dashboard-chart-grid" style={{ marginTop: 16 }}>
        <HorizontalBarChartCard
          title={`Top Products · ${label}`}
          subtitle="Net product sales after discounts and approved returns"
          data={chartData.topProducts}
          formatValue={(value) => money.format(value)}
        />
        <section className="chart-card attention-card">
          <div className="chart-heading">
            <div>
              <h3>Business Attention</h3>
              <p>Period metrics, current state and 30-day intelligence are labelled separately</p>
            </div>
          </div>
          <div className="attention-metrics">
            <div><span>Expenses · {label}</span><strong>{money.format(summary.expenses || 0)}</strong></div>
            <div><span>Discount · {label}</span><strong>{money.format(summary.discounts || 0)}</strong></div>
            <div><span>Low Stock · Current</span><strong>{summary.low_stock_count || 0}</strong></div>
            <div><span>Cash Variance · {label}</span><strong>{money.format(summary.cash_variance || 0)}</strong></div>
            <div><span>Requires Review · 30D</span><strong>{exceptions.length}</strong></div>
          </div>
          <p className="muted-text" style={{ marginTop: 10 }}>
            Sales and profit values already account for discounts and approved returns. Do not deduct them again.
          </p>
        </section>
      </div>

      <div className="settings-grid" style={{ marginTop: 16 }}>
        <section className="panel">
          <div className="section-row"><h3>What Should I Do Next? · 30D Intelligence</h3><Link to="/owner/recommendations">View all</Link></div>
          {recommendations.slice(0, 6).map((row, index) => (
            <Link
              to={row.action_path || "/owner"}
              className="recommendation-row"
              key={`${row.recommendation_type}-${index}`}
            >
              <div><strong>{row.title}</strong><p>{row.message}</p></div>
              <span className={`priority ${String(row.priority).toLowerCase()}`}>{row.priority}</span>
            </Link>
          ))}
        </section>
        <section className="panel">
          <div className="section-row"><h3>Requires Review · 30D</h3><Link to="/owner/exceptions">Open Loss & Exceptions</Link></div>
          {exceptions.slice(0, 6).map((row, index) => (
            <div className="recommendation-row" key={`${row.entity_id}-${index}`}>
              <div><strong>{row.exception_type.replaceAll("_", " ")}</strong><p>{row.summary}</p></div>
              <span className={`priority ${String(row.severity).toLowerCase()}`}>{row.severity}</span>
            </div>
          ))}
        </section>
      </div>

      <div className="quick-action-grid">
        <Link className="quick-action" to="/owner/profit"><strong>Profit Intelligence</strong><span>Net revenue → FIFO COGS → expenses → operating profit</span></Link>
        <Link className="quick-action" to="/inventory/intelligence"><strong>Inventory Health</strong><span>Dead stock, stockout risk and return-adjusted reordering</span></Link>
        <Link className="quick-action" to="/purchasing/intelligence"><strong>Purchase Intelligence</strong><span>Supplier pricing and landed-cost margin impact</span></Link>
        <Link className="quick-action" to="/owner/share"><strong>Share with Owner</strong><span>Prepare a reconciled WhatsApp operating summary</span></Link>
      </div>
    </div>
  );
}
