import { BookOpen, ChevronRight, CircleHelp } from "lucide-react";

const chapters = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Sign in, understand your role and confirm the correct shop context.",
    items: [
      "Sign in with your assigned WineShopPOS account.",
      "Confirm the current shop before starting operational work.",
      "Only modules permitted for your role are shown.",
    ],
  },
  {
    id: "pos-billing",
    title: "POS & Billing",
    description: "Barcode scanning, cart, permitted pricing controls, payments and receipts.",
    items: [
      "Scan a barcode or search for a product.",
      "Review quantity, customer and permitted pricing adjustments.",
      "Choose Cash, UPI or Card and complete the sale.",
      "Print the receipt when required.",
    ],
  },
  {
    id: "sales-returns",
    title: "Sales, Returns & Voids",
    description: "Find invoices and process controlled returns or voids.",
    items: [
      "Open Sales to locate the original invoice.",
      "Use the return or void workflow rather than changing stock manually.",
      "Provide the required reason and approval where policy requires it.",
    ],
  },
  {
    id: "shifts",
    title: "Shifts & Day Close",
    description: "Opening cash, shift operation, reconciliation and close.",
    items: [
      "Open the cashier shift with opening cash.",
      "Complete normal billing during the shift.",
      "Enter actual closing cash and review any variance.",
      "Resolve pending offline activity before final close.",
    ],
  },
  {
    id: "products",
    title: "Products & Barcodes",
    description: "Product master, barcode details and label printing.",
    items: [
      "Create or edit products from Product Master.",
      "Maintain barcode, SKU, brand, size, case size, purchase price and selling price.",
      "Use Barcode Labels for label printing.",
    ],
  },
  {
    id: "purchasing",
    title: "Purchases & Receiving",
    description: "Suppliers, purchase orders, bulk receiving and invoice OCR.",
    items: [
      "Use Receive Stock for direct multi-line supplier receipts.",
      "Use Procurement for the controlled purchase-order lifecycle.",
      "Review OCR product matches, quantities and pricing before receiving.",
      "Inventory increases only after the controlled receipt succeeds.",
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    description: "Stock, counts, ageing, FIFO guidance and branch transfers.",
    items: [
      "Use Inventory for current stock and stock movement history.",
      "Use Stock Count for physical verification.",
      "Use Transfers for movement between authorized shops.",
      "Use Inventory Intelligence for ageing, stockout risk, dead stock and overstock.",
    ],
  },
  {
    id: "operations",
    title: "Operations",
    description: "Expenses, approvals, customers, rewards and offline queue.",
    items: [
      "Record and void operating expenses through controlled workflows.",
      "Review pending approvals from the Approval Center.",
      "Manage customer loyalty, promotions, store credit and vouchers where authorized.",
      "Resolve offline synchronization conflicts instead of forcing stock.",
    ],
  },
  {
    id: "owner-center",
    title: "Owner Center",
    description: "Business performance, profit, exceptions and recommendations.",
    items: [
      "Review revenue, bills, profit, expenses and inventory indicators.",
      "Use Profit Intelligence for margin and COGS views.",
      "Review operational exceptions using Leakage Shield.",
      "Use recommendations for stock and operational follow-up.",
    ],
  },
  {
    id: "reports",
    title: "Reports & Compliance",
    description: "Operational exports, accountant exports and configured compliance data.",
    items: [
      "Choose the required date range before exporting reports.",
      "Use accountant/Tally-ready export when required.",
      "Validate final accounting mappings with the accountant.",
      "Maintain only verified shop licence/compliance information.",
    ],
  },
  {
    id: "settings",
    title: "Settings & Administration",
    description: "Users, access, hardware, backup, audit and shop settings.",
    items: [
      "Authorized administrators can manage staff and role access.",
      "Use Hardware for scanner and printer configuration.",
      "Use Backup & Recovery for operational export evidence.",
      "Use Audit Log to review captured administrative activity.",
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Common scanner, inventory, OCR, offline and printer checks.",
    items: [
      "Confirm scanner input and barcode mapping when a product does not scan.",
      "Refresh cloud stock when inventory changed during checkout.",
      "Do not receive an OCR invoice until all uncertain lines are corrected.",
      "Check printer paper size and calibration when receipt layout is incorrect.",
    ],
  },
  {
    id: "daily-checklist",
    title: "Daily Shop Checklist",
    description: "Recommended opening, operating and closing checks.",
    items: [
      "Opening: confirm connectivity, shift, scanner and printer.",
      "During day: use controlled workflows for sales, receipts, returns and stock changes.",
      "Closing: sync offline queue, reconcile cash and review pending approvals.",
    ],
  },
];

export default function Help() {
  return (
    <div className="page-stack help-center" id="help-top">
      <section className="panel help-hero">
        <div className="panel-header">
          <div>
            <p className="help-eyebrow">PRODUCT SUPPORT</p>
            <h2>Help & User Manual</h2>
            <p className="muted">
              Guidance for billing, inventory, purchases, operations,
              reporting and administration.
            </p>
          </div>
          <div className="help-hero-icon" aria-hidden="true">
            <CircleHelp size={28} />
          </div>
        </div>

        <a
          className="primary-button help-manual-button"
          href="/manual/index.html"
          target="_blank"
          rel="noreferrer"
        >
          <BookOpen size={17} />
          Open Full User Manual
        </a>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Browse by chapter</h3>
            <p className="muted">Select a chapter to jump directly to its guidance.</p>
          </div>
        </div>

        <nav className="help-chapter-grid" aria-label="User manual chapters">
          {chapters.map((chapter, index) => (
            <a className="help-chapter-card" href={`#${chapter.id}`} key={chapter.id}>
              <span className="help-chapter-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="help-chapter-copy">
                <strong>{chapter.title}</strong>
                <small>{chapter.description}</small>
              </span>
              <ChevronRight size={18} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </section>

      <div className="help-section-list">
        {chapters.map((chapter, index) => (
          <section className="panel help-section" id={chapter.id} key={chapter.id}>
            <div className="help-section-heading">
              <span className="help-chapter-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{chapter.title}</h3>
                <p className="muted">{chapter.description}</p>
              </div>
            </div>

            <ol className="help-step-list">
              {chapter.items.map((item) => <li key={item}>{item}</li>)}
            </ol>

            <a className="help-back-link" href="#help-top">Back to chapters</a>
          </section>
        ))}
      </div>
    </div>
  );
}
