import { useId } from "react";

// Power BI-inspired categorical palette: strong, readable, restrained.
const PALETTE = ["#118DFF", "#12239E", "#E66C37", "#6B007B", "#E044A7", "#744EC2", "#D9B300", "#197278", "#D64550"];

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatDefault(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safeNumber(value));
}

function EmptyChart({ message = "Not enough data yet" }) {
  return <div className="chart-empty">{message}</div>;
}

export function LineChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault }) {
  const gradientId = useId().replaceAll(":", "");
  const rows = data.filter((row) => Number.isFinite(Number(row?.[valueKey])));
  if (!rows.length) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;

  const width = 680; const height = 230; const left = 28; const right = 18; const top = 20; const bottom = 34;
  const values = rows.map((row) => safeNumber(row[valueKey]));
  const max = Math.max(...values, 0); const min = Math.min(...values, 0); const spread = Math.max(1, max - min);
  const x = (index) => rows.length === 1 ? width / 2 : left + index * ((width - left - right) / (rows.length - 1));
  const y = (value) => top + (max - value) / spread * (height - top - bottom);
  const points = rows.map((row, index) => `${x(index)},${y(safeNumber(row[valueKey]))}`).join(" ");
  const areaPoints = `${left},${height-bottom} ${points} ${x(rows.length-1)},${height-bottom}`;
  const labelIndexes = [...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])];
  const last = rows[rows.length - 1];

  return <section className="chart-card">
    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div><strong>{formatValue(last[valueKey])}</strong></div>
    <div className="line-chart" role="img" aria-label={`${title}. Latest value ${formatValue(last[valueKey])}.`}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#118DFF" stopOpacity="0.24"/><stop offset="100%" stopColor="#118DFF" stopOpacity="0"/></linearGradient></defs>
        {[0, .5, 1].map((ratio) => <line key={ratio} x1={left} x2={width-right} y1={top + ratio*(height-top-bottom)} y2={top + ratio*(height-top-bottom)} className="chart-grid-line"/>)}
        <polygon points={areaPoints} fill={`url(#${gradientId})`}/>
        <polyline points={points} className="chart-line-path"/>
        {rows.map((row, index) => index === rows.length-1 || index % Math.max(1, Math.ceil(rows.length/8)) === 0 ? <circle key={index} cx={x(index)} cy={y(safeNumber(row[valueKey]))} r="3.2" className="chart-line-point"><title>{row[labelKey]}: {formatValue(row[valueKey])}</title></circle> : null)}
      </svg>
      <div className="chart-axis-labels">{labelIndexes.map((index) => <span key={index} style={{ left: `${x(index)/width*100}%` }}>{rows[index]?.[labelKey]}</span>)}</div>
    </div>
  </section>;
}

export function DonutChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault, centerLabel = "Total" }) {
  const rows = data.filter((row) => safeNumber(row?.[valueKey]) > 0);
  const total = rows.reduce((sum, row) => sum + safeNumber(row[valueKey]), 0);
  if (!total) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;
  let cursor = 0;
  const stops = rows.map((row, index) => { const start = cursor; cursor += safeNumber(row[valueKey]) / total * 100; return `${PALETTE[index % PALETTE.length]} ${start}% ${cursor}%`; });
  return <section className="chart-card">
    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div>
    <div className="donut-layout">
      <div className="donut-chart" style={{ background: `conic-gradient(${stops.join(",")})` }} role="img" aria-label={`${title}. ${rows.map((row)=>`${row[labelKey]} ${formatValue(row[valueKey])}`).join(", ")}.`}><div className="donut-hole"><span>{centerLabel}</span><strong>{formatValue(total)}</strong></div></div>
      <div className="chart-legend">{rows.map((row,index)=><div key={`${row[labelKey]}-${index}`}><i style={{ background: PALETTE[index % PALETTE.length] }}/><span>{row[labelKey]}</span><strong>{formatValue(row[valueKey])}</strong></div>)}</div>
    </div>
  </section>;
}

export function HorizontalBarChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault, limit = 7 }) {
  const rows = data.filter((row) => Number.isFinite(Number(row?.[valueKey]))).slice(0, limit);
  const max = Math.max(...rows.map((row) => safeNumber(row[valueKey])), 0);
  if (!rows.length || max <= 0) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;
  return <section className="chart-card">
    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div>
    <div className="horizontal-bars" role="img" aria-label={title}>{rows.map((row,index)=><div className="horizontal-bar-row" key={`${row[labelKey]}-${index}`}><div className="horizontal-bar-meta"><span title={row[labelKey]}>{row[labelKey]}</span><strong>{formatValue(row[valueKey])}</strong></div><div className="horizontal-bar-track"><div className="horizontal-bar-fill" style={{ width: `${Math.max(3, safeNumber(row[valueKey])/max*100)}%`, background: PALETTE[index % PALETTE.length] }}/></div></div>)}</div>
  </section>;
}

export function ColumnChartCard({ title, subtitle, data = [], valueKey = "value", labelKey = "label", formatValue = formatDefault }) {
  const rows = data.filter((row) => Number.isFinite(Number(row?.[valueKey])));
  const max = Math.max(...rows.map((row) => Math.abs(safeNumber(row[valueKey]))), 0);
  if (!rows.length || max <= 0) return <section className="chart-card"><div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div><EmptyChart/></section>;
  return <section className="chart-card">
    <div className="chart-heading"><div><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div>
    <div className="column-chart" role="img" aria-label={title}>{rows.map((row,index)=>{
      const value=safeNumber(row[valueKey]);
      return <div className="column-item" key={`${row[labelKey]}-${index}`} title={`${row[labelKey]}: ${formatValue(value)}`}>
        <div className="column-value">{formatValue(value)}</div>
        <div className="column-track"><div className={`column-fill ${value<0?"negative":""}`} style={{height:`${Math.max(6,Math.abs(value)/max*100)}%`,background:value<0?"#D64550":PALETTE[index%PALETTE.length]}}/></div>
        <div className="column-label">{row[labelKey]}</div>
      </div>;
    })}</div>
  </section>;
}
