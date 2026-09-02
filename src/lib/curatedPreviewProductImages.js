// PREVIEW_CURATED_7_PRODUCT_IMAGES_V4
//
// Preview-only curated product-image fallbacks for the seven current demo products.
// Existing Supabase product image always wins; this mapping is only used when imageUrl
// is empty. Barcode is the primary key so product-name spelling corrections do not
// break the preview image.
//
// For commercial production, replace these demo/reference URLs with supplier- or
// manufacturer-approved assets uploaded through the existing Product Image feature.

const BY_BARCODE = {
  // Carlsberg Elephant Strong — 650 ml bottle
  "8906018942955":
    "https://assets.gqindia.com/photos/65eb1d14c24543d62d22a25f/master/w_1600%2Cc_limit/Carlsberg-Elephant-.jpg",

  // Carlsberg/Cartsberg Elephant Strong — 500 ml can
  "8906018940142":
    "https://a.fsimg.co.nz/product/retail/fan/image/master/5034624.png",

  // Tuborg Classic with Scotch Malts — 650 ml bottle
  "8906018945093":
    "https://fatafatsewa.com/storage/media/2560/ofTtZ18707.jpg",

  // Tuborg Classic with Scotch Malts — 500 ml can
  "8906018945192":
    "https://carlsberg-group-2022.euwest01.umbraco.io/media/4wak3u4k/tbc-new_500-ml.png",

  // Tuborg Strong — 650 ml bottle
  "8906018946823":
    "https://d1z88p83zuviay.cloudfront.net/ProductVariantImages/5453ebbe-fba5-4322-ac75-ad0fbfd37099.jpg",

  // Tuborg Strong — 500 ml can
  "8906018940104":
    "https://admin115421-prod.s3.ap-southeast-2.amazonaws.com/public/product-4lgs7VkvAQtPji8fLrza5-0.jpg",

  // Tuborg Strong — 330 ml bottle
  "8906018940128":
    "https://d37ky63zmmmzfj.cloudfront.net/production/itemimages/beer/imported/tuborg_strongbeer_650mlbottle.jpg",
};

function normalized(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function curatedPreviewProductImage(product) {
  const barcode = String(product?.barcode || "").trim();
  if (BY_BARCODE[barcode]) return BY_BARCODE[barcode];

  // Name fallback protects the demo if a barcode is temporarily unavailable.
  const name = normalized(product?.name);
  const size = Number(product?.sizeMl || 0);

  if (/carlsberg|cartsberg/.test(name) && /elephant/.test(name)) {
    if (/can/.test(name) || size === 500) {
      return BY_BARCODE["8906018940142"];
    }
    return BY_BARCODE["8906018942955"];
  }

  if (/tuborg|turorg/.test(name) && /classic/.test(name)) {
    if (/can/.test(name) || size === 500) {
      return BY_BARCODE["8906018945192"];
    }
    return BY_BARCODE["8906018945093"];
  }

  if (/tuborg|turorg/.test(name) && /strong/.test(name)) {
    if (/can/.test(name) || size === 500) {
      return BY_BARCODE["8906018940104"];
    }
    if (size === 330) return BY_BARCODE["8906018940128"];
    return BY_BARCODE["8906018946823"];
  }

  return "";
}
