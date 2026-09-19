import { PERIOD_PRESETS } from "../../lib/businessDate";

export default function PeriodSelector({
  preset,
  from,
  to,
  onPresetChange,
  onFromChange,
  onToChange,
  loading = false,
  onRefresh,
}) {
  return (
    <section className="panel" style={{ marginBottom: 16 }}>
      <div className="button-row wrap">
        {PERIOD_PRESETS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={preset === option.id ? "primary-button" : "secondary-button"}
            onClick={() => onPresetChange(option.id)}
            disabled={loading}
          >
            {option.label}
          </button>
        ))}

        {onRefresh ? (
          <button
            type="button"
            className="secondary-button"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        ) : null}
      </div>

      {preset === "CUSTOM" ? (
        <div className="filter-bar" style={{ marginTop: 12 }}>
          <label>
            From
            <input
              type="date"
              value={from}
              onChange={(event) => onFromChange(event.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={to}
              onChange={(event) => onToChange(event.target.value)}
            />
          </label>
        </div>
      ) : null}

      <p className="muted-text" style={{ margin: "10px 0 0" }}>
        {from === to ? from : `${from} → ${to}`} · India business date · LIVE
      </p>
    </section>
  );
}
