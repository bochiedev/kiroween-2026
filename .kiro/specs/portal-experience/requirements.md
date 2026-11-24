# Portal experience: requirements

Status: drafted. Depends on `digital-lab` (route `/lab`).

## Introduction
A landing page at `/` with a CSS and SVG dimensional portal, a clear **ENTER THE LAB** call to action and one optional 1 to 1.5 s transition into the lab. No video, no WebGL, no heavy dependency.

## Requirements

### R1. Landing content
1. `/` SHALL show an `h1` with the product name, one sentence on what the learner does, and a link named `ENTER THE LAB` pointing to `/lab?mode=digital`.
2. The portal SHALL be an inline SVG with layered CSS and SHALL be decorative (`aria-hidden`), so the page reads correctly without it.
3. The first paint SHALL show the heading, the portal and the link without waiting for the lab chunk.

### R2. Transition
1. Activating the CTA with motion allowed SHALL play one portal transition lasting between 1000 and 1500 ms and then navigate to `/lab?mode=digital`.
2. Under `prefers-reduced-motion: reduce` the CTA SHALL navigate immediately and no transition SHALL play.
3. The link SHALL keep a real `href`, so open in new tab, middle click and no-JS navigation reach `/lab`.
4. A second activation during the transition SHALL NOT start a second transition or a second navigation.
5. Opening `/lab` directly SHALL NOT play any portal animation.

### R3. Motion and performance
1. Animation SHALL use only `transform` and `opacity`.
2. Ambient portal motion SHALL stop under `prefers-reduced-motion: reduce`.
3. The lab chunk MAY be preloaded on CTA hover or focus, and SHALL be loaded no later than navigation.
4. The landing route SHALL NOT import `@xyflow/react` or camera code.

### R4. Accessibility and layout
1. The CTA SHALL have visible focus and a target at least 44 px high.
2. Text contrast SHALL use the steering palette (`#F4F1FF` on `#080911`).
3. At 360 px width the page SHALL have no horizontal scroll and the CTA SHALL be inside the viewport without scrolling at 360x740.
4. The page SHALL have exactly one `h1` and one `main` landmark.
