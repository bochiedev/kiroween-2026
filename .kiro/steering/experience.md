---
inclusion: auto
name: visual-experience
description: Use for landing portal, lab UI, React layout, motion, Halloween theming, and performance/accessibility decisions.
---
# Visual and motion standards
- Theme: futuristic dimensional portal + atmospheric Halloween research lab, elegant rather than cartoonish.
- Palette: #080911, #170D2B, #8B5CF6, #FF7518, #49F5E8, #F4F1FF.
- Homepage hero CTA: ENTER THE LAB; direct /lab route must work without animation.
- Main motion: one 1–1.5s optional portal transition. Otherwise restrained meaningful microinteractions.
- Prefer CSS transforms, SVG and efficient assets to heavy videos/WebGL. Lazy-load camera module.
- Respect prefers-reduced-motion, visible focus, WCAG-conscious contrast, mobile layouts, network constraints.
- Provide camera permission only after explicit user action; never assume hardware exists.
- Lab prioritizes readability and system state clarity over atmospheric effects.
