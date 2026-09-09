/**
 * Central OCR learning registry for supplier-invoice evidence.
 *
 * Rules must be contextual and conservative. Never add a broad replacement such
 * as every "MI" -> "ML"; a rule must prove the token is being used as a size
 * unit or another explicitly-scoped invoice token.
 */

export const OCR_LEARNING_RULES = Object.freeze([
  Object.freeze({
    id: "SIZE_MI_TO_ML",
    context: "SIZE",
    description: "Correct OCR-confused ml units only when immediately preceded by a numeric size.",
    apply(value) {
      return String(value || "").replace(
        /\b(\d+(?:\.\d+)?)\s*m(?:i|1)\b/gi,
        (_match, number) => `${number} ml`,
      );
    },
  }),
  Object.freeze({
    id: "BRAND_CARTSBERG_TO_CARLSBERG",
    context: "PRODUCT",
    description: "Observed supplier-invoice OCR correction for the Carlsberg brand token.",
    apply(value) {
      return String(value || "").replace(/\bcartsberg\b/gi, "Carlsberg");
    },
  }),
  Object.freeze({
    id: "BEER_LAGAR_TO_LAGER",
    context: "BEER_PRODUCT",
    description: "Correct lager OCR only on beer-like product evidence.",
    apply(value) {
      const text = String(value || "");
      const beerContext =
        /\b(beer|lager|lagar|larger|stout|ale|pilsner|witbier|can|bottle)\b/i.test(text) ||
        /\b(tuborg|carlsberg|kingfisher|budweiser|heineken|corona|bira|hoegaarden|haywards|fosters)\b/i.test(text);
      return beerContext ? text.replace(/\b(lagar|larger)\b/gi, "Lager") : text;
    },
  }),
]);

export function applyOcrLearningRules(value, { context = "INVOICE" } = {}) {
  let text = String(value || "");
  const appliedRuleIds = [];

  for (const rule of OCR_LEARNING_RULES) {
    const before = text;
    text = rule.apply(text, context);
    if (text !== before) appliedRuleIds.push(rule.id);
  }

  return { text, appliedRuleIds };
}

export function normalizeOcrEvidenceText(value, options = {}) {
  return applyOcrLearningRules(value, options).text;
}
