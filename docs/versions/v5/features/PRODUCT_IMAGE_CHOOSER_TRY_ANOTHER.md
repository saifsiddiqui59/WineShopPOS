# V5 Product Image — Try Another + Chooser

Marker: `V5_PRODUCT_IMAGE_CHOOSER_TRY_ANOTHER_20260907`

Status: IMPLEMENTED IN V5 / MANUAL UAT REQUIRED

## UX

Edit Product now provides:

- **Try Another Image**
  - one click;
  - chooses the highest-ranked image that is not current and has not already
    been used for this product;
  - when all candidates have been used, it may cycle to a non-current result.

- **Choose Image**
  - opens a modal;
  - displays up to 8 image thumbnails;
  - shows Current / Previously used / confidence indicators;
  - user clicks **Use this image** to apply exactly that candidate.

For a product with no image, **Find Image Online** still performs the simple
automatic first-image flow, and **Choose Image** is also available.

## Free-quota protection

The existing SerpApi free-only guard remains mandatory.

Image-choice results are cached in the existing product_enrichment_cache table:

- positive candidate set: 24 hours;
- empty candidate set: 30 minutes.

Opening/reopening the chooser or repeatedly using Try Another normally reuses
the cached candidate set and does not trigger another provider search.

When a fresh provider search is required, the existing limit remains maximum
2 SerpApi Google Images requests per product search operation.

No automatic paid upgrade or paid fallback is introduced.

## Trust boundary

The browser never sends an arbitrary image URL to be imported.

The browser sends only:
- productId,
- server-generated choiceCacheKey,
- server-generated candidateId.

The Edge Function re-opens the fresh server-side cached choice set and imports
only the candidate belonging to that set.

The existing safe image downloader still enforces HTTPS, DNS/private-network
blocking, redirect revalidation, 5 MB limit and raster magic-byte checks.

## Product safety

After a user-selected or Try Another image is linked, the server verifies:

- barcode unchanged;
- Product Master name unchanged;
- brand unchanged;
- size unchanged;
- image_path equals the newly created managed image.

Only image_path is allowed to mutate.

## Candidate history

Recent image audit records are used to determine:

- Current candidate;
- Previously used candidates.

Try Another prefers a candidate that is neither current nor previously used.

## PROD

This feature is V5/DEV only until UAT and explicit promotion approval.
