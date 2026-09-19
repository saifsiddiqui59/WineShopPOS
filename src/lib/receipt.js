import { supabase } from "./supabase";

const num = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export function normalizeReceiptPayload(row) {
  const tenders = (row?.tenders || []).map((entry) => ({
    type: String(entry.type || "OTHER"),
    amount: num(entry.amount),
    reference: entry.reference || "",
    source: entry.source || "",
  }));
  const external = tenders.find((entry) => entry.source === "EXTERNAL") || tenders[0] || null;

  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    createdAt: row.created_at,
    businessDate: row.business_date,
    cashierId: row.cashier_id,
    shiftId: row.shift_id,
    clientSaleId: row.client_sale_id,
    status: row.status,
    paymentStatus: row.payment_status,
    subtotal: num(row.subtotal),
    manualDiscount: num(row.manual_discount),
    promotionDiscount: num(row.promotion_discount),
    loyaltyDiscount: num(row.loyalty_discount),
    discount: num(row.discount),
    grandTotal: num(row.grand_total),
    loyaltyPointsRedeemed: num(row.loyalty_points_redeemed),
    loyaltyPointsEarned: num(row.loyalty_points_earned),
    storeCreditUsed: num(row.store_credit_used),
    giftVoucherUsed: num(row.gift_voucher_used),
    approvedReturnTotal: num(row.approved_return_total),
    paymentMethod: external?.type || "",
    paymentReference: external?.reference || "",
    tenders,
    refunds: (row?.refunds || []).map((entry) => ({
      id: entry.id,
      method: entry.method,
      amount: num(entry.amount),
      reference: entry.reference || "",
      returnRequestId: entry.return_request_id,
      createdAt: entry.created_at,
    })),
    items: (row?.items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name || "Product",
      barcode: item.barcode || "",
      quantity: num(item.quantity),
      unitPrice: num(item.unit_price),
      lineTotal: num(item.line_total),
      purchasePrice: num(item.fifo_unit_cost),
      fifoLineCost: num(item.fifo_line_cost),
    })),
  };
}

export async function loadAuthoritativeReceipt(saleId) {
  const { data, error } = await supabase.rpc("sale_receipt_v1", { p_sale_id: saleId });
  if (error) throw error;
  if (!data?.id) throw new Error("Authoritative receipt was not returned.");
  return normalizeReceiptPayload(data);
}
