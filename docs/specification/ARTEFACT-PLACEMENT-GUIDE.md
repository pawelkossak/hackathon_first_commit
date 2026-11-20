---
answers: >-
  Where every runtime asset is used, which scene and action select it, which geometry is authoritative and how to verify the handoff.
excludes: >-
  Bank integration, recorded narrator audio, unplanned levels or runtime certification from static layouts alone.
status: current
updated: 2026-11-17
---

# Artefact placement guide

This is the entry point for implementation. Import by asset id, never by guessing a filename from a concept board. Concept PNGs are review references, not full-screen UI backgrounds.

| Contract | Purpose and required use |
| --- | --- |
| `design/runtime-import-manifest.json` | 182 canonical runtime assets, dimensions, size, load policy. Source paths are relative to design/. App asset pipeline copies them to public/media/. |
| `design/contracts/scene-catalog.json` | G01–G36 scene names, states, copy and voice ids and layout references. |
| `design/contracts/scene-asset-bindings.json` | 567 stable binding ids. Each names scene, state, trigger, asset selection, slot, layer, exact guard, duration, completion and fallback. |
| `design/contracts/placement-contract.json` | 72 viewport-specific views. For each binding id: rectangle, coordinate space, fit and z-index. Global font/audio bindings intentionally have no image rectangle. |
| `design/layouts/complete/` | JSON, SVG and PNG references for every scene: desktop 1440×900, landscape mobile 844×390; G35 email 600×960 and 375×1030. |
| `design/contracts/action-command-map.json` | Copy/action id to application command. Scene navigation is separate from financial mutation. |
| `design/contracts/engine-presentation-event-map.json` | Engine camelCase event to scene, presentation event, exact voice script ids and expression. |
| `design/contracts/emotion-portrait-map.json` | Narrator intent to actual approved pose, independently selected player/narrator gender. |
| `design/first-load-manifest.json` | Twelve scenario sets. Load the selected set, not the union of all firstLoad flags. Max 1,167,718 bytes including four fonts and icons. |
| `design/motion/animation-manifest.json` | 20 animated WebP clips with staticWebP alternatives; APNG references excluded from initial load. |
| `design/motion/motion-blueprints.json` | Eighteen transitions for live UI components, cancellation, reduced motion and commit boundaries. |
| `design/audio/sfx/sfx-manifest.json` | Thirty-five procedural WAV effects; user gesture, mute and volume required. |
| `design/current-contract-qa.json` | Latest static verification; older QA is historical and points here. |

## Application rules

1. Scene id selects layout and the bindings for that scene. Resolve gender-specific asset ids against the chosen gender. Evaluate declarative guard predicates through explicit typed application conditions, never eval(). A binding with role authoring-reference and guard false is excluded; this avoids drawing an account background twice.
2. At reference dimensions, honour slot position, fit, layering and whitespace. At other dimensions, reflow or compensate control dimensions so transformed interactive hit areas remain at least 44×44 CSS pixels. Do not simply shrink a reference canvas and its buttons. Test 1280×800, 1440×900, 812×375, 844×390 and 932×430. Portrait phones show the rotate instruction.
3. G13 card illustrations occupy separate cells in horizontal scroll content. Their live title, cost, eligibility and confirmation remain part of the same card. G31 uses three separate comparison columns. Do not stack all card sprites in a shared rectangle.
4. G10 shows the route and current week from the engine. Calendar labels, balances, progress and card terms are live text. Weather stars are decoration; earned score stars come only from engine scoring. The Pilot star follows successful plan persistence.
5. G20 displays the brass rewind dial and week tickets. Disabled weeks have no snapshot. Confirmation calls rewind once; animation completion never applies a second rewind.
6. G11 chooses E1 account-change, E2 new-order, E3 AI-tool or E6 late-customer illustration by actual event id. The obligation image is only for an obligation detail, not a replacement for E5. E5 is the non-bank SMS scene G16; it is never styled as the bank.
7. G33/G34/G36 use the selected narrator. G36 must have real channel toggles, quiet-from/to, timezone and demo reminder fields. A scheduled acknowledgement follows the scheduler response; it never asserts delivery. G35 email uses its own responsive geometry and corrected owner signature.
8. Engine text and status update immediately. Then play decorative motion. Cancel obsolete motion/audio on scene disposal and stop hidden loops. Reduced motion swaps animated image source for its static companion; CSS animation:none does not stop WebP/APNG playback.

## Known completion boundary

All listed asset ids exist; all scene bindings resolve; the 72 reference layouts fit their viewports and specified interactive boxes are at least 44×44. All 20 WebP clips decode with the exact intended durations (duplicate frames may be coalesced). This does not by itself prove application layout, focus order, email-client rendering, live push delivery or deployed loading speed.

Real narrator audio is the remaining generation dependency. `data/voice-bindings.demo.json` holds the spoken Polish bindings for the fixed demo (184 narrator lines). Dynamic scripts must bind the current engine result, rather than reuse a static recording with different amounts. Until recordings exist, captions remain visible and the missing-media status stays explicit.

## Reproducible checks

Run `python3 design/tooling/validate-contracts.py` for current file, layout, duration and budget validation (Pillow required). Run the root test/typecheck/build commands for code. `design/tooling/render-motion.py` reproduces the authored clip set from existing components; no image generation is required to rerender it.