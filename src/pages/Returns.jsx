import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { useScanner } from "../context/ScannerContext";
import { normalizeReceiptPayload } from "../lib/receipt";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const num = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

function normalizeContext(row) {
  if (!row?.sale?.id) return null;

  return {
    sale: normalizeReceiptPayload(row.sale),
    lines: (row.return_lines || []).map((line) => ({
      saleItemId: line.sale_item_id,
      productId: line.product_id,
      productName: line.product_name || "Product",
      barcode: line.barcode || "",
      soldQty: num(line.sold_qty),
      approvedQty: num(line.approved_returned_qty),
      pendingQty: num(line.pending_return_qty),
      availableQty: num(line.available_return_qty),
      unitPrice: num(line.unit_price),
      lineTotal: num(line.line_total),
    })),
    hasReturnActivity: Boolean(row.has_return_activity),
    voidEligible: Boolean(row.void_eligible),
  };
}

export default function Returns() {
  const { refreshAll } = useShop();
  const { profile } = useAuth();
  const { lastScan, successBeep, errorBeep } = useScanner();

  const [lookup, setLookup] = useState("");
  const [matches, setMatches] = useState([]);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [selectedContext, setSelectedContext] = useState(null);
  const [selectedBusy, setSelectedBusy] = useState(false);

  const [qty, setQty] = useState({});
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  const manager = ["ADMIN", "MANAGER"].includes(profile?.role);
  const selected = selectedContext?.sale || null;
  const returnLines = selectedContext?.lines || [];

  const canRequest =
    selected &&
    selected.status !== "VOID" &&
    returnLines.some((line) => line.availableQty > 0);

  async function loadQueue() {
    const { data, error } = await supabase
      .from("sale_return_requests")
      .select(
        "id,sale_id,status,reason,refund_method,total_refund,created_at,reviewed_at,sale_return_items(id,sale_item_id,product_id,quantity,unit_refund,line_refund)",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) setMessage(error.message);
    else setRequests(data || []);
  }

  useEffect(() => {
    void loadQueue();
  }, []);

  async function findInvoices(rawLookup = lookup, fromScanner = false) {
    const value = String(rawLookup || "").trim();

    if (value.length < 3) {
      setMatches([]);
      setMessage("Scan a barcode or enter at least 3 invoice / product characters.");
      if (fromScanner) errorBeep();
      return;
    }

    setLookupBusy(true);
    setMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "return_void_invoice_lookup_v1",
        {
          p_lookup: value,
          p_limit: 50,
        },
      );

      if (error) throw error;

      const next = data || [];
      setMatches(next);

      if (!next.length) {
        setMessage(`No accessible invoice or product match found for ${value}.`);
        if (fromScanner) errorBeep();
      } else {
        setMessage(
          `${next.length} invoice${next.length === 1 ? "" : "s"} found. Select the correct invoice before returning or voiding.`,
        );
        if (fromScanner) successBeep();
      }
    } catch (error) {
      setMatches([]);
      setMessage(error?.message || "Unable to find matching invoices.");
      if (fromScanner) errorBeep();
    } finally {
      setLookupBusy(false);
    }
  }

  useEffect(() => {
    if (!lastScan?.id || !lastScan?.barcode) return;

    setLookup(lastScan.barcode);
    void findInvoices(lastScan.barcode, true);
  }, [lastScan?.id]);

  async function selectInvoice(saleId) {
    setSelectedBusy(true);
    setMessage("");
    setQty({});

    try {
      const { data, error } = await supabase.rpc(
        "return_void_sale_context_v1",
        { p_sale_id: saleId },
      );

      if (error) throw error;

      const next = normalizeContext(data);

      if (!next) {
        throw new Error("Invoice return context was not returned.");
      }

      setSelectedContext(next);
      setMessage(
        `Selected ${next.sale.invoiceNumber}. Review sold, already returned, pending and available quantities before continuing.`,
      );
    } catch (error) {
      setSelectedContext(null);
      setMessage(error?.message || "Unable to load the selected invoice.");
    } finally {
      setSelectedBusy(false);
    }
  }

  async function reloadSelected() {
    if (!selected?.id) return;

    const { data, error } = await supabase.rpc(
      "return_void_sale_context_v1",
      { p_sale_id: selected.id },
    );

    if (!error && data?.sale?.id) {
      setSelectedContext(normalizeContext(data));
    }
  }

  async function requestReturn(event) {
    event.preventDefault();

    if (!selected) {
      setMessage("Scan/search and select the original invoice first.");
      return;
    }

    const items = returnLines
      .map((line) => ({
        sale_item_id: line.saleItemId,
        quantity: Number(qty[line.saleItemId] || 0),
      }))
      .filter((item) => item.quantity > 0);

    if (!items.length) {
      setMessage("Enter at least one return quantity.");
      return;
    }

    if (!reason.trim()) {
      setMessage("Return reason is required.");
      return;
    }

    const { error } = await supabase.rpc("create_return_request", {
      p_sale_id: selected.id,
      p_items: items,
      p_reason: reason.trim(),
      p_refund_method: method,
      p_refund_reference: reference.trim() || null,
    });

    setMessage(
      error
        ? error.message
        : "Return request submitted for Manager/Admin approval. Inventory has not changed yet.",
    );

    if (!error) {
      setQty({});
      setReason("");
      await Promise.all([loadQueue(), reloadSelected()]);
      if (lookup.trim()) await findInvoices(lookup);
    }
  }

  async function review(id, action) {
    const fn =
      action === "approve"
        ? "approve_return_request"
        : "reject_return_request";

    const args =
      action === "approve"
        ? { p_request_id: id }
        : {
            p_request_id: id,
            p_note: "Rejected by manager",
          };

    const { error } = await supabase.rpc(fn, args);

    setMessage(
      error
        ? error.message
        : `Return ${action}d.`,
    );

    if (!error) {
      await Promise.all([
        loadQueue(),
        refreshAll(),
        reloadSelected(),
      ]);

      if (lookup.trim()) {
        await findInvoices(lookup);
      }
    }
  }

  async function voidSale() {
    if (!manager) {
      setMessage("Only Manager/Admin can void an entire sale.");
      return;
    }

    if (!selected || !reason.trim()) {
      setMessage("Select an invoice and enter a void reason.");
      return;
    }

    if (!selectedContext?.voidEligible) {
      setMessage(
        "This invoice is not eligible for full void. Use the return workflow instead.",
      );
      return;
    }

    if (
      !window.confirm(
        `Void ${selected.invoiceNumber}? Stock will be restored and refund recorded.`,
      )
    ) return;

    const { error } = await supabase.rpc("void_sale", {
      p_sale_id: selected.id,
      p_reason: reason.trim(),
      p_refund_method: method,
      p_refund_reference: reference.trim() || null,
    });

    setMessage(
      error
        ? error.message
        : "Sale voided and stock restored.",
    );

    if (!error) {
      await refreshAll();
      await loadQueue();

      if (lookup.trim()) {
        await findInvoices(lookup);
      }

      await reloadSelected();
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Returns, Refunds & Voids</h2>
          <p>
            Scan the product first. WineShopPOS lists invoices containing that
            product so you can choose the correct bill before any return or void.
          </p>
        </div>
      </div>

      {message ? (
        <div className="purchase-message">
          {message}
        </div>
      ) : null}

      <section className="panel">
        <h3>1. Find Original Invoice</h3>

        <p className="muted-text">
          Scan the bottle/can barcode, or search by invoice number or product
          name. Search only finds candidate invoices; it never changes stock
          or money.
        </p>

        <div className="button-row wrap">
          <input
            data-scanner-capture="barcode"
            value={lookup}
            onChange={(event) => setLookup(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void findInvoices();
              }
            }}
            placeholder="Scan barcode or search invoice / product name"
            style={{ width: "100%", maxWidth: 520 }}
            autoFocus
          />

          <button
            type="button"
            className="primary-button"
            disabled={lookupBusy}
            onClick={() => void findInvoices()}
          >
            {lookupBusy ? "Searching..." : "Find Invoices"}
          </button>
        </div>

        {matches.length ? (
          <div className="data-table-wrapper" style={{ marginTop: 14 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Business Date</th>
                  <th>Matched Product</th>
                  <th>Sold</th>
                  <th>Returned</th>
                  <th>Pending</th>
                  <th>Available</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {matches.map((row) => (
                  <tr key={row.sale_id}>
                    <td>
                      <strong>{row.invoice_number}</strong>
                    </td>
                    <td>{row.business_date}</td>
                    <td>{row.matched_products || "-"}</td>
                    <td>{row.matched_sold_qty}</td>
                    <td>{row.approved_returned_qty}</td>
                    <td>{row.pending_return_qty}</td>
                    <td>
                      <strong>{row.available_return_qty}</strong>
                    </td>
                    <td>{money.format(row.grand_total || 0)}</td>
                    <td>
                      {String(row.sale_status || "").replaceAll("_", " ")}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={selectedBusy}
                        onClick={() => void selectInvoice(row.sale_id)}
                      >
                        Select Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {selected ? (
        <div
          className="settings-grid"
          style={{ marginTop: 16 }}
        >
          <form
            className="panel"
            onSubmit={requestReturn}
          >
            <h3>
              2. Return / Void · {selected.invoiceNumber}
            </h3>

            <p>
              {selected.businessDate} · {money.format(selected.grandTotal)} ·{" "}
              <strong>
                {String(selected.status || "").replaceAll("_", " ")}
              </strong>
            </p>

            <div className="settings-fields">
              {returnLines.map((line) => (
                <label key={line.saleItemId}>
                  {line.productName}
                  {line.barcode ? ` · ${line.barcode}` : ""}

                  <small style={{ display: "block" }}>
                    Sold {line.soldQty} · Returned {line.approvedQty} · Pending{" "}
                    {line.pendingQty} · Available {line.availableQty}
                  </small>

                  <input
                    type="number"
                    min="0"
                    max={line.availableQty}
                    disabled={
                      line.availableQty <= 0 ||
                      selected.status === "VOID"
                    }
                    value={qty[line.saleItemId] || 0}
                    onChange={(event) =>
                      setQty({
                        ...qty,
                        [line.saleItemId]: event.target.value,
                      })
                    }
                  />
                </label>
              ))}

              <label>
                Reason
                <input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  required
                />
              </label>

              <label>
                Refund Method
                <select
                  value={method}
                  onChange={(event) => setMethod(event.target.value)}
                >
                  <option>CASH</option>
                  <option>UPI</option>
                  <option>CARD</option>
                </select>
              </label>

              <label>
                Refund Reference
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                />
              </label>
            </div>

            <br />

            <button
              className="primary-button"
              disabled={!canRequest}
            >
              Request Return
            </button>

            {manager ? (
              <button
                type="button"
                className="danger-button"
                onClick={() => void voidSale()}
                disabled={!selectedContext?.voidEligible}
                style={{ marginLeft: 8 }}
              >
                Void Entire Sale
              </button>
            ) : null}

            {manager && !selectedContext?.voidEligible ? (
              <p className="muted-text">
                Full void is unavailable when the invoice is not a clean
                COMPLETED sale or has pending/approved return activity.
              </p>
            ) : null}
          </form>

          <section className="panel">
            <h3>Safety Rules</h3>

            <p>
              Barcode scan is a lookup only. Always select and review the
              invoice before submitting.
            </p>

            <p>
              Cashier can request a return only for accessible own-sale scope.
              Manager/Admin can review shop invoices.
            </p>

            <p>
              Return quantity already subtracts both PENDING and APPROVED return
              quantities, preventing accidental duplicate return requests.
            </p>

            <p>
              Approval restores inventory and records the refund. Full void
              remains Manager/Admin only and only for a clean completed invoice.
            </p>
          </section>
        </div>
      ) : null}

      <section
        className="panel"
        style={{ marginTop: 16 }}
      >
        <h3>Return Queue</h3>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Created</th>
                <th>Sale</th>
                <th>Qty</th>
                <th>Refund</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((row) => (
                <tr key={row.id}>
                  <td>
                    {new Date(row.created_at).toLocaleString("en-IN")}
                  </td>
                  <td>{row.sale_id.slice(0, 8)}</td>
                  <td>
                    {(row.sale_return_items || []).reduce(
                      (total, item) =>
                        total + Number(item.quantity || 0),
                      0,
                    )}
                  </td>
                  <td>{money.format(row.total_refund || 0)}</td>
                  <td>{row.reason}</td>
                  <td>{row.status}</td>
                  <td>
                    {manager && row.status === "PENDING" ? (
                      <>
                        <button
                          className="secondary-button"
                          onClick={() => void review(row.id, "approve")}
                        >
                          Approve
                        </button>{" "}
                        <button
                          className="secondary-button"
                          onClick={() => void review(row.id, "reject")}
                        >
                          Reject
                        </button>
                      </>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
