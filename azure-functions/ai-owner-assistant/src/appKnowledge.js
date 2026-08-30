const TOPICS = [
  {
    id: "receive_bulk_inventory",
    title: "Receive multiple / bulk inventory lines",
    route: "/purchasing/receive",
    area: "Purchasing → Receive Stock",
    roles: ["ADMIN","MANAGER"],
    keywords: ["bulk inventory","bulk stock","receive stock","add inventory","multiple products","purchase receipt","grn","goods receipt"],
    summary: "Use controlled purchase receipt with multiple product lines. Do not directly edit inventory for normal incoming stock.",
    steps: [
      "Open Purchasing → Receive Stock.",
      "Select supplier and invoice details.",
      "Add all product lines required for the receipt.",
      "Confirm cases, bottles per case, loose bottles and final bottle quantity.",
      "Review purchase price, optional batch/expiry and landed-cost adjustments.",
      "Confirm receipt so WineShopPOS posts stock transactionally."
    ],
    cautions: [
      "There is no recommendation to bypass the purchase receipt workflow with arbitrary direct inventory edits.",
      "For invoice extraction, use Invoice OCR in Purchase Intelligence."
    ]
  },
  {
    id: "invoice_ocr",
    title: "Receive supplier invoice with OCR",
    route: "/purchasing/intelligence",
    area: "Purchasing → Purchase Intelligence → Invoice OCR",
    roles: ["ADMIN","MANAGER"],
    keywords: ["ocr","invoice scan","scan invoice","supplier invoice","invoice image","invoice pdf","product alias","unmatched product"],
    summary: "OCR is review-first. Every extracted line must resolve to a product before receipt.",
    steps: [
      "Open Purchasing → Purchase Intelligence and start Invoice OCR.",
      "Review each extracted description and quantity interpretation.",
      "Strong matches may be preselected; verify them.",
      "For uncertain/unmatched lines choose Select Existing Product or Create New Product.",
      "Confirm the mapping so the invoice description can be reused as a product alias.",
      "Confirm cases, bottles/case, loose bottles and final bottle quantity.",
      "Continue to controlled Receive Stock."
    ],
    cautions: ["Unresolved OCR lines must not post inventory."]
  },
  {
    id: "add_product",
    title: "Add a new product",
    route: "/products/new",
    area: "Products → New Product",
    roles: ["ADMIN","MANAGER"],
    keywords: ["add product","new product","create product","new barcode","product master","barcode product"],
    summary: "Create the product master first when an item is not already in the shop catalog.",
    steps: [
      "Open Products → New Product.",
      "Enter barcode/SKU, product identity, category and commercial fields.",
      "Save the product.",
      "Use Purchasing → Receive Stock for incoming stock quantity."
    ],
    cautions: ["Creating a product master is different from receiving inventory."]
  },
  {
    id: "stock_ageing_fifo",
    title: "View stock ageing and FIFO rotation",
    route: "/inventory/intelligence",
    area: "Inventory → Intelligence",
    roles: ["ADMIN","MANAGER"],
    keywords: ["ageing","aging","fifo","old stock","stock age","receipt lot","batch age","old inventory"],
    summary: "Receipt-lot based ageing and FIFO analytical rotation are available for tracked V2 receipts.",
    steps: [
      "Open Inventory → Intelligence.",
      "Review receipt-based ageing buckets and tracked lots.",
      "Use the FIFO rotation view to see oldest remaining tracked receipt lots first."
    ],
    cautions: ["Legacy/opening stock without a tracked V2 receipt can appear UNTRACKED rather than receiving a fake age."]
  },
  {
    id: "stock_history",
    title: "View old stock / product movement history",
    route: "/inventory",
    area: "Inventory",
    roles: ["ADMIN","MANAGER"],
    keywords: ["history","old data","stock history","movement history","how old","previous stock","past inventory","730"],
    summary: "Use inventory movement/history views for retained production records. The Owner AI stock-history tool accepts a maximum query window of 730 days.",
    steps: [
      "Open Inventory for product and movement history.",
      "Use the available product/date filters.",
      "For AI stock-history questions, identify the product by name, SKU or barcode."
    ],
    cautions: [
      "The 730-day value is the AI tool query cap, not a promise that every record exists for 730 days.",
      "Availability depends on retained production records; deleted or never-retained data cannot be recovered by AI."
    ]
  },
  {
    id: "sales_history",
    title: "View sales and past bills",
    route: "/pos/sales",
    area: "POS → Sales",
    roles: ["ADMIN","MANAGER","CASHIER"],
    keywords: ["sales history","old bill","past bill","invoice history","previous sales","find invoice","sales data"],
    summary: "Use POS → Sales for retained bills and sale details.",
    steps: ["Open POS → Sales.", "Use available filters/search.", "Open a sale to view bill details and receipt."]
  },
  {
    id: "add_user",
    title: "Add or manage a user",
    route: "/admin/users",
    area: "Admin → Users",
    roles: ["ADMIN"],
    keywords: ["add user","new user","invite user","create cashier","create manager","employee login","user management"],
    summary: "User creation/membership management is an ADMIN workflow.",
    steps: [
      "Open Admin → Users.",
      "Create/invite the user using the available workflow.",
      "Assign the intended shop membership and role.",
      "Verify the user's access with the intended role."
    ],
    cautions: ["Do not share another person's login. CASHIER/MANAGER cannot grant themselves ADMIN access."]
  },
  {
    id: "roles_access",
    title: "Understand roles and shop access",
    route: "/admin/access",
    area: "Admin → Access",
    roles: ["ADMIN"],
    keywords: ["role","permission","admin","manager","cashier","access","shop access","membership"],
    summary: "WineShopPOS uses ADMIN, MANAGER and CASHIER roles with shop membership authorization.",
    steps: ["Open Admin → Access.", "Review memberships and assigned roles.", "Use least-privilege access appropriate to the employee."]
  },
  {
    id: "stock_count",
    title: "Perform physical stock count",
    route: "/inventory/count",
    area: "Inventory → Stock Count",
    roles: ["ADMIN","MANAGER"],
    keywords: ["stock count","physical count","inventory count","count bottles","stock take","stocktake"],
    summary: "Use the controlled stock-count workflow rather than direct stock edits.",
    steps: ["Open Inventory → Stock Count.", "Create/open the count.", "Enter physical quantities.", "Submit for the configured approval/reconciliation workflow."]
  },
  {
    id: "stock_transfer",
    title: "Transfer stock between shops",
    route: "/inventory/transfers",
    area: "Inventory → Transfers",
    roles: ["ADMIN","MANAGER"],
    keywords: ["transfer","stock transfer","move stock","another shop","shop transfer","in transit"],
    summary: "Advanced transfer follows a controlled lifecycle.",
    steps: [
      "Open Inventory → Transfers.",
      "Create/request the transfer.",
      "Follow the available status actions through approval, dispatch, transit and receipt."
    ],
    cautions: ["Lifecycle: REQUESTED → APPROVED → DISPATCHED → IN_TRANSIT → RECEIVED → COMPLETED."]
  },
  {
    id: "approvals",
    title: "Review pending approvals",
    route: "/operations/approvals",
    area: "Operations → Approvals",
    roles: ["ADMIN","MANAGER"],
    keywords: ["approval","approve","reject","discount approval","price override","purchase order approval","return approval"],
    summary: "Approval Center centralizes sensitive operational requests.",
    steps: ["Open Operations → Approvals.", "Review request detail/reason.", "Approve or reject using the available action."]
  },
  {
    id: "discount_override",
    title: "Discount or item-price override at POS",
    route: "/pos",
    area: "POS",
    roles: ["ADMIN","MANAGER","CASHIER"],
    keywords: ["discount","price override","change price","manager approval","override reason"],
    summary: "Manual discounts and item-price changes are controlled and backend-authorized.",
    steps: [
      "Build the bill in POS.",
      "Enter the required discount or item price.",
      "Select a standardized reason.",
      "If cashier policy requires approval, request it.",
      "Manager/Admin reviews in Operations → Approvals.",
      "Complete sale after approval."
    ],
    cautions: ["Changing controlled pricing after approval requires a new approval."]
  },
  {
    id: "customer_rewards",
    title: "Loyalty, coupon, store credit and gift voucher",
    route: "/operations/customers",
    area: "Operations → Customers / POS",
    roles: ["ADMIN","MANAGER"],
    keywords: ["loyalty","points","coupon","promotion","promo","gift voucher","voucher","store credit","customer rewards"],
    summary: "Customer commercial benefits are managed by authorized roles and revalidated during checkout.",
    steps: [
      "Use Operations → Customers to manage promotions, loyalty adjustments, store credit or gift vouchers.",
      "At POS select the customer where required.",
      "Enter/preview the applicable benefit.",
      "Complete checkout; the database revalidates balances and eligibility."
    ]
  },
  {
    id: "accountant_export",
    title: "Export accountant / Tally-ready ledger",
    route: "/reports",
    area: "Reports & Exports",
    roles: ["ADMIN","MANAGER"],
    keywords: ["tally","accountant","export ledger","accounting export","csv","debit credit","voucher"],
    summary: "Reports provides a balanced ledger-oriented CSV for accountant/Tally mapping.",
    steps: ["Open Reports & Exports.", "Choose From/To dates.", "Select Export Accountant / Tally-ready Ledger.", "Give the file to the accountant for final ledger-name/import mapping."],
    cautions: ["WineShopPOS does not claim one universal one-click Tally import configuration."]
  },
  {
    id: "supplier_score_purchase_coach",
    title: "Supplier score and Purchase Coach",
    route: "/purchasing/intelligence",
    area: "Purchasing → Purchase Intelligence",
    roles: ["ADMIN","MANAGER"],
    keywords: ["supplier score","supplier performance","purchase coach","reorder","overstock","margin risk","no movement","best supplier"],
    summary: "Purchase Intelligence combines supplier evidence and stock/demand signals for decision support.",
    steps: ["Open Purchasing → Purchase Intelligence.", "Review Supplier Performance Score.", "Review Purchase Coach flags such as REORDER, NO_MOVEMENT, OVERSTOCK and MARGIN_RISK."]
  },
  {
    id: "leakage_shield",
    title: "Review Leakage Shield exceptions",
    route: "/owner/exceptions",
    area: "Owner Center → Leakage Shield",
    roles: ["ADMIN"],
    keywords: ["leakage","loss","exception","fraud","unusual discount","cash variance","audit exception"],
    summary: "Leakage Shield surfaces neutral review signals; it does not accuse employees.",
    steps: ["Open Owner Center → Leakage Shield.", "Review severity/type/amount/context.", "Open the linked source record before taking action."]
  },
  {
    id: "scanner_printer",
    title: "Set up barcode scanner or receipt printer",
    route: "/admin/hardware",
    area: "Admin → Hardware",
    roles: ["ADMIN"],
    keywords: ["scanner","barcode scanner","printer","receipt printer","80mm","58mm","hardware"],
    summary: "Hardware setup and diagnostics are under Admin → Hardware.",
    steps: ["Open Admin → Hardware.", "Use Scanner Test for barcode input.", "Use Printer setup/test for receipt printing."]
  },
  {
    id: "backup_audit",
    title: "Backup and audit history",
    route: "/admin/audit",
    area: "Admin",
    roles: ["ADMIN"],
    keywords: ["backup","audit","activity log","who changed","security history","audit history"],
    summary: "Admin contains backup/recovery controls and audit activity views.",
    steps: ["Use Admin → Backup for the available backup workflow.", "Use Admin → Audit for retained audit activity."]
  }
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9₹]+/g, " ")
    .trim();
}

function tokens(value) {
  return new Set(normalize(value).split(/\s+/).filter((t) => t.length > 1));
}

function scoreTopic(topic, question) {
  const q = normalize(question);
  const qTokens = tokens(question);
  let score = 0;

  for (const phrase of topic.keywords) {
    const p = normalize(phrase);
    if (q.includes(p)) score += p.includes(" ") ? 10 : 5;
    for (const token of tokens(phrase)) {
      if (qTokens.has(token)) score += 1;
    }
  }

  const searchable = tokens(`${topic.title} ${topic.area} ${topic.summary}`);
  for (const token of qTokens) {
    if (searchable.has(token)) score += 1;
  }
  return score;
}

export function searchAppKnowledge(question) {
  const cleaned = String(question || "").trim().slice(0, 500);
  if (!cleaned) throw new Error("A functionality help question is required.");

  const ranked = TOPICS
    .map((topic) => ({ topic, score: scoreTopic(topic, cleaned) }))
    .sort((a,b) => b.score - a.score || a.topic.title.localeCompare(b.topic.title));

  const positive = ranked.filter((x) => x.score > 0).slice(0, 4);
  const selected = positive.length ? positive : [];

  return {
    question: cleaned,
    knowledge_version: "2026-08-30-v2",
    read_only: true,
    found: selected.length > 0,
    matches: selected.map(({topic,score}) => ({
      id: topic.id,
      title: topic.title,
      area: topic.area,
      route: topic.route,
      roles: topic.roles,
      summary: topic.summary,
      steps: topic.steps,
      cautions: topic.cautions || [],
      relevance_score: score
    })),
    fallback: selected.length ? null :
      "This workflow is not in the verified WineShopPOS functionality knowledge set. Do not invent steps; tell the user you do not have verified app guidance for it."
  };
}

export const APP_KNOWLEDGE_TOPICS = TOPICS;
