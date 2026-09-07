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
