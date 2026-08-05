# Post-purchase visual assets manifest

Status values: planned, generated, approved, rejected, integrated.

| Route | Section | Visual function | Asset type | Final path | Ratio | Prompt concept | Exclusions | Status | QA |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /up1 | La Segunda Pérdida hero | Establish hope versus a second loss before the product reveal | Editorial photorealistic still | apps/marketing/public/images/upsells/generated/up1-second-loss-v1.webp | 16:10 | Late-night hand with phone, reopened doorway, second red shadow | No text, logo, readable UI, tears, melodrama, erotic content, malformed hands | integrated | 1586×992 WebP; full-size anatomy, crop space, screen and responsive render inspected |
| /up1, /d1 | Tal vez ya viviste esto | Hold the instant before opening an important new message | Editorial photorealistic still | apps/marketing/public/images/upsells/generated/up1-message-reopens-v1.webp | 4:5 | Bedside phone glow, empty space, hope and restraint | No text, logo, readable message, face requirement, distorted device, malformed hands | integrated | 1122×1402 WebP; full-size hand, device, linen and responsive render inspected |
| /up1 | Reciprocidad Progresiva | Support the reciprocity mechanism without using a heart cliché | Symbolic editorial still | apps/marketing/public/images/upsells/generated/up1-reciprocity-v1.webp | 16:10 | Two hands aligning equal pieces into a path | No text, logo, heart, emphasized rings, malformed hands | integrated | 1587×991 WebP; both hands, equal pieces, non-romantic symbolism and render inspected |
| /up2, /d2 | Imagina tener esta ayuda | Establish anxiety becoming organized clarity around a new message | Editorial photorealistic still | apps/marketing/public/images/upsells/generated/up2-new-message-v1.webp | 16:10 | Night phone, notebook and tea, red tension and green guidance | No text, logo, fake chat bubbles, holograms, malformed hands | integrated | 1586×992 WebP; hand, blank screen, notebook and responsive render inspected |
| /up2 | Es como tener una segunda cabeza | Visualize context becoming an explained decision without sci-fi | Conceptual editorial illustration | apps/marketing/public/images/upsells/generated/up2-context-decision-v1.webp | 16:10 | Message fragments pass through a restrained grid into one clear path | No text, logo, brain, robot, hologram | integrated | 1586×992 WebP; blank fragments, legible flow, prohibited symbols and render inspected |

## Reference and implementation decisions

- Existing product screenshots remain the only product proof. Generated images are atmosphere or editorial explanation.
- References were researched with Exa and Agent Reach before generation. The direction favors restrained magazine photography, lived-in surfaces, imperfect natural detail, controlled red/ivory/charcoal palettes, and readable negative space.
- Generated images contain no typography. All headings, messages, labels, prices, diagrams and comparisons are deterministic HTML, CSS or SVG.
- Responsive implementation uses explicit intrinsic dimensions and accurate `sizes`; only the actual hero candidate receives eager/high-priority loading.
- The mobile decision bar must not obscure focused content or legal controls and must respect reduced motion.
