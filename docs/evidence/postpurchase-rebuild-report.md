# Post-purchase pages rebuild report

Date: 2026-08-05

Routes: `/up1`, `/d1`, `/up2`, `/d2`

Deployment: not performed.

## Canonical copy contract

The rendered content is generated from the versioned Oracle snapshots in
`apps/marketing/content/upsells`. The long UP1 snapshot is split at a Markdown
block boundary to respect the repository file-size rule; the parser rejoins the
parts with the original blank line before hashing or rendering.

| Route | SHA-256 of normalized canonical copy | CTA pairs |
| --- | --- | --- |
| `/up1` | `0c263763d91a5a65fec5d17aed868cd1fd2084cbfffbdb7f5f27612ad420af62` | 3 |
| `/d1` | `8719ca1bf533868321c673747d1deb797f872fede2e1133d284d8dd8c77b07bc` | 3 |
| `/up2` | `3a792c62ad6781b83ec78a85641decc43e07a1ab48831e1afa2d70241541365a` | 4 |
| `/d2` | `8435a3ca1f16828954538772b58de2140584904b2d5f8a5ff22ad8501f5ab706` | 4 |

`npm run verify:upsell-copy` fails if a snapshot hash, block order, CTA text,
price, duration, legal line, or generated JSON artifact changes unexpectedly.

## Implementation proof

- Route environment variables and decline paths remain unchanged.
- Valid query values are preserved on checkout and decline URLs.
- A missing or unparsable checkout environment value renders a disabled accept
  control instead of inventing a destination.
- All four pages expose one `h1`, `noindex, nofollow`, unique IDs, and legal
  links.
- The mobile decision bar is hidden at the top, appears only after the first
  decision block has passed, and hides again near the legal footer.
- Generated photography contains no embedded text. Product proof uses existing
  screenshots and document pages. Diagrams are deterministic HTML/CSS/SVG.

## Automated validation

Passed locally:

```text
npm --prefix apps/marketing run test:upsells
npm --prefix apps/marketing run typecheck
npm --prefix apps/marketing run lint
npm --prefix apps/marketing run build
git diff --check
```

The browser matrix covered each route at widths 320, 375, 390, 430, 768, 1024,
1440, and 1920 pixels. Across all 32 combinations:

- horizontal overflow was `0`;
- the smallest visible decision/legal target was at least `44px`;
- each page had one `h1` and no duplicate IDs;
- the 64-character canonical hash was present;
- checkout links preserved both synthetic QA query values;
- the robots directive was `noindex, nofollow`;
- browser console warnings and errors were `0`.

Full-page evidence at 390 and 1440 pixels, viewport captures for all requested
widths, and the sticky-bar capture are stored under
`output/playwright/postpurchase-2026-08-05`.

## Deliberate limit

Checkout URLs used during browser QA were synthetic `checkout.example` URLs.
No real payment, deployment, or production smoke test was attempted.
