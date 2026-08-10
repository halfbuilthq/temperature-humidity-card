# Design QA — Temperature & Humidity Card

## Visual truth

- Selected design: `selected-comfort-dial-reference.png`
- Final implementation: `temperature-humidity-card-dashboard.png`
- Full comparison: `design-qa-comparison-full.png`
- Focused comparison: `design-qa-comparison-focus.png`

## Test conditions

- Viewport: 1280 × 800 CSS pixels at 1× scale
- Reference: 1586 × 992 source normalized to 1280 × 800 for direct comparison
- State: dark Home Assistant indoor-climate dashboard with eight room cards
- Data states: comfortable rooms, two cold rooms, healthy batteries hidden, one 18% low-battery warning
- Browser: Codex in-app Browser

## Comparison history

1. The first implementation render exposed black mock room icons, a native button treatment on the low-battery warning, and a shallow semicircle instead of the selected wraparound dial.
2. The room-icon mock was moved into its own shadow root with inherited color, the battery warning was reset to a transparent button, and the gauge was rebuilt as a 260° arc.
3. Full-view and first-row side-by-side comparisons showed the card hierarchy was correct but the dial and primary temperature were undersized.
4. The final pass increased the dial, temperature scale, track visibility, and vertical spacing; it also added restrained surface depth while retaining Home Assistant theme variables.

## Final assessment

- P0: none
- P1: none
- P2: none
- P3: the generated reference has a stronger ambient glow and decorative overflow menus. The implementation keeps the glow more restrained for theme compatibility and omits non-functional card controls.
- Layout: all eight cards fit at the target tablet viewport with no clipping or overlap.
- Hierarchy: room, exception state, temperature, humidity, and 24-hour range remain clear at tablet distance.
- Behavior: temperature, humidity, history, and low-battery elements open Home Assistant more-info; healthy batteries stay hidden; there are no AC controls.
- Accessibility: semantic buttons, visible focus outlines, labelled actions, and unavailable states are present.
- Runtime: no browser errors; the only warning is Lit's expected development-mode notice from the Vite preview.

final result: passed
