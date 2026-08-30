export const FEATURE_TIERS = Object.freeze({
  smart_purchase_intelligence: "PRO",
  inventory_intelligence: "PRO",
  owner_control_center: "PRO",
  profit_intelligence: "PRO",
  audit_loss_control: "PRO",
  smart_recommendations: "PLUS",
  advanced_procurement: "PLUS",
  advanced_transfers: "PLUS",
  owner_whatsapp_summary: "PLUS",
  customer_credit: "PLUS",
});

export const APP_VERSION = "2026.08-master-consolidation";

export function featureTier(featureKey) {
  return FEATURE_TIERS[featureKey] || null;
}
