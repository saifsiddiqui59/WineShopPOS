# V5 Product Image Search — SerpApi Free V2

Marker: `V5_PRODUCT_IMAGE_SERPAPI_FREE_V2_20260907`

Baseline SHA: `b7e98a4ca139e72e90c800c1992471f8953e9aaa`

## Provider decision

WineShopPOS uses SerpApi Google Images only when the provider Account API reports
a monthly price of exactly $0.

Runtime defaults:

`SERPAPI_ALLOW_PAID=false`

Any future paid usage requires a deliberate configuration change after explicit
user approval.

If free quota is exhausted:
- no paid search is attempted;
- no automatic upgrade occurs;
- manual image upload remains available.

## Search strategy

For a missing Product Master image:

1. Existing managed image => use it.
2. High-confidence same-shop equivalent => reuse it with zero search calls.
3. Build SEARCH-ONLY identity from:
   - current Product Master,
   - existing product_aliases,
   - same-shop sibling products and brands.
4. Conservative brand correction requires:
   - close spelling,
   - and shared distinctive product-family token evidence.
5. Run one Google Images search through SerpApi.
6. Only if the first result set is insufficient, run one simplified second query.
7. Rank returned images locally.
8. Try up to eight safe image downloads.
9. Attach the first safe, sufficiently matching image.
10. Verify barcode/name/brand/size remained unchanged.
11. Audit provider, query, source, confidence and provenance.

Maximum external image-search requests per missing product: **2**.

## Carlsberg regression fixture

Saved DEV product:

`Cartsberg Elephant Strong Super Premium Beer CAN`
`500 ml`
barcode `8906018940142`

Same-shop product-family evidence contains Carlsberg + Elephant.

Allowed search-only transformation:

`Cartsberg ...` => `Carlsberg Elephant Strong ... 500 ml Can India`

Not allowed:
- changing Product Master brand automatically;
- changing Product Master name automatically;
- using the barcode as the Google Images query;
- changing barcode.

Expected barcode before and after:

`8906018940142`

## Cache behavior

AUTO_IMAGE does not use the generic 30-day Product Enrichment discovery cache.
This prevents an old negative catalogue-provider response from hiding the
broad-image provider.

SerpApi may itself return its own short-lived cached search result; according to
the provider, cached searches are not counted against monthly searches.

## Source safety

The existing server-side image downloader remains responsible for:
- HTTPS only,
- DNS/private-network blocking,
- redirect revalidation,
- maximum 5 MB,
- JPEG/PNG/WebP magic-byte verification,
- rejecting HTML/SVG/text payloads.

Source page, original image URL, publisher and license-details URL (when present)
are retained in audit metadata.
