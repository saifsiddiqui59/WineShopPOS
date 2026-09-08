# V5 Automatic Product Image Enrichment

Marker: `V5_PRODUCT_IMAGE_AUTO_ENRICHMENT_20260907`

Status: IMPLEMENTED IN V5 / DEV PREVIEW UAT REQUIRED

Starting V5 SHA: `72802e13243de2bc549e6e4aa9f4bc54405443ca`

## Final UX

Product Master image and barcode are independent.

For a product with no managed image:

1. Click the image/placeholder icon in Product Master.
2. WineShopPOS automatically searches for an image.
3. Exact same-shop product image is preferred when an exact name + brand + size match exists.
4. Otherwise configured internet sources are searched using saved Product Master name + brand + size + inferred package context.
5. The best non-conflicting image candidate is copied into WineShopPOS-managed `product-images` storage.
6. Product Master refreshes automatically.

No image-selection dialog and no barcode scan are required for this image-only action.

## Barcode safety

The AUTO_IMAGE browser request sends only:

- shop ID
- product ID
- replace true/false

The server loads the saved product name/brand/size itself.

The server:
- does not use the product barcode as the image search query,
- ignores internet candidate barcode values for image attachment,
- calls only `set_product_image` for the Product Master mutation,
- verifies the saved barcode before and after the image link,
- records `barcode_changed=false` in audit metadata.

Image search does not mutate:
- barcode,
- name/brand/size/category,
- price/MRP/purchase price,
- stock/inventory,
- purchase/sales data.

## Wrong image correction

If the automatic image is wrong:

- open Edit Product,
- click `Find / Replace Image Online`, or
- upload a permitted JPEG/PNG/WebP manually, or
- remove the managed image.

An existing Product Master image links to Edit Product rather than silently replacing itself from the list.

## Barcode/product verification separation

The existing Product Enrichment / physical-barcode workflow remains available as:

`Verify Product / Barcode`

It may show external images as identification references, but it no longer imports an image. Actual Product Master image mutation is handled only by the dedicated image workflow.

## Internet coverage

Existing configured providers are used automatically:
- UPCItemDB,
- OpenFoodFacts,
- Brave Images when the server-side `BRAVE_SEARCH_API_KEY` is configured.

No browser/React secret is added. If Brave is not configured, the other sources and exact same-shop image reuse still operate.

## UAT

Manual UAT must verify:
- missing image icon click,
- image appears after refresh,
- barcode value remains exactly unchanged,
- existing image click opens Edit Product,
- Edit Product Find/Replace works,
- custom upload can replace an incorrect automatic image,
- no cross-shop image access,
- QA/DEV V5 badge remains visible.

## V5_16 — Add Product auto-load parity

Starting parent: `d58098f4eecfc5c85729d4ac41f9c789bcf6e8ef`

Human UAT showed that OCR -> Add Product displayed `No image` until the user
started a manual Product Image lookup.

### Add Product workflow

For a new Product Master item:

1. when product name/brand/size are available, Add Product automatically renders
   the existing non-mutating Product Image discovery preview;
2. the user can still use `Review / Find Product Image`, upload JPEG/PNG/WebP or
   use `Open Camera`;
3. when the product is saved without an uploaded or securely confirmed image,
   Add Product calls the same automatic Product Image workflow used by the
   Products page: `autoFindProductImage({ replace:false })`;
4. Add Product waits for image processing and refreshes Product Master before
   returning to OCR / Products.

The preview never mutates Product Master. Final image persistence happens only
after a real Product Master ID exists.

### Safety / cost

- barcode is never changed by Product Image processing;
- stock/prices/invoice quantities are not changed;
- no new database object;
- no new Edge Function;
- no new Azure resource;
- **No new paid service**;
- existing free-only image provider-plan/quota guard remains authoritative.
