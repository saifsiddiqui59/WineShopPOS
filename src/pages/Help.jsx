import { BookOpen, ExternalLink, ShieldCheck } from "lucide-react";

const topics = [
  ["POS & Billing", "Scan → Cart → Pay → Print. Use controlled discount or price override when required."],
  ["Receive Stock", "Purchases & Suppliers → Receive Stock for multi-line stock receipts."],
  ["Invoice OCR", "Purchase Intelligence → Invoice OCR. Resolve every invoice line before receiving stock."],
  ["Inventory", "Use Stock Count, Transfers and Inventory Intelligence instead of arbitrary stock edits."],
  ["Customers", "Loyalty, promotions, store credit and gift vouchers use controlled workflows."],
  ["Reports", "Reports & Exports includes operational and accountant/Tally-ready exports."],
];

export default function Help() {
  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Help & User Manual</h2>
            <p className="muted">Current WineShopPOS V2 operating guide.</p>
          </div>
          <BookOpen size={28}/>
        </div>

        <div className="action-row">
          <a className="btn primary" href="/manual/WineShopPOS_User_Manual.md" target="_blank" rel="noreferrer">
            <BookOpen size={17}/> Open full User Manual
          </a>
          <a
            className="btn secondary"
            href="https://github.com/saifsiddiqui59/WineShopPOS/blob/main/docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={17}/> Canonical source
          </a>
        </div>
      </section>

      <section className="panel">
        <h3>Quick guide</h3>
        <div className="metric-grid">
          {topics.map(([title,text]) => (
            <article className="metric-card" key={title}>
              <strong>{title}</strong>
              <p className="muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Ask WineShopPOS</h3>
            <p className="muted">
              Owner AI can explain verified app workflows and navigation. It remains read-only.
            </p>
          </div>
          <ShieldCheck size={22}/>
        </div>
        <p>Example: <strong>How do I add bulk inventory?</strong></p>
        <p className="muted">For complete instructions, use the full User Manual above.</p>
      </section>
    </div>
  );
}
