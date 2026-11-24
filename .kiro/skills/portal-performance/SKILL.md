---
name: portal-performance
description: Use for PaperFault cinematic Halloween portal, landing page animation, web performance, mobile responsiveness, and reduced-motion support.
---
# Portal implementation review
1. Design the immersive portal with layered CSS and SVG; use no giant video or 3D dependency by default.
2. Ensure a meaningful static first frame while JS loads, and link to /lab directly.
3. Prefer transform/opacity animation; respect prefers-reduced-motion and low-power variants.
4. Lazy-load camera code and costly lab visualizations.
5. Use a production build, mobile viewport, network/CPU throttling and actual browser measurements; capture conditions and numbers.
6. Record visible user outcomes, not adjectives like 'buttery smooth' without measurements.
