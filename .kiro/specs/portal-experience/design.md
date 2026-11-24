# Portal experience: design

- Component `Portal` (inline SVG: concentric rings, a violet to cyan glow, an orange crack) and `Landing` (heading, copy, CTA). Styles in `src/landing/landing.css`, imported by `Landing` only.
- `Landing` is part of the main chunk so first paint needs no extra request. It is small. The lab stays a lazy chunk.
- CTA is an `<a href="/lab?mode=digital">`. The click handler checks `matchMedia('(prefers-reduced-motion: reduce)')`. If reduced, it navigates at once. Otherwise it sets `entering` (adds class `portal-entering` on the root), calls `import('../lab/Lab')` to warm the chunk, and navigates after `TRANSITION_MS = 1200` through a timeout held in the component. Modified clicks (ctrl, meta, shift, middle) are left to the browser.
- The timeout lives in the React component, never in the simulation kernel. The guard `entering` makes repeat activations no-ops, and cleanup clears the timer on unmount.
- Transition: `.portal-entering` scales the SVG (transform) and fades the page copy (opacity) over 1200 ms. `@media (prefers-reduced-motion: reduce)` removes ambient rotation and the transition.
- Ambient motion: slow `transform: rotate` on two rings, with `will-change` only on those rings.
- Palette tokens: `#080911`, `#170D2B`, `#8B5CF6`, `#FF7518`, `#49F5E8`, `#F4F1FF`.
- Tests: Playwright for CTA href, navigation with and without reduced motion, transition class present and timing between 1000 and 1500 ms, double click guard, 360 px overflow, and one `h1`. Unit test for the pure helper `shouldAnimate(reduced, modifiers)`.
