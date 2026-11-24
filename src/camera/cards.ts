// Pure card builders. No relative imports, so scripts/generate-cards.mjs can run this with Node directly.

export interface CardSource {
  /** Component name, for example "api". */
  id: string;
  /** Human label, for example "API". */
  label: string;
  /** ArUco dictionary id. */
  markerId: number;
  /** Output of the library's `Dictionary.generateSVG(markerId)`. */
  markerSvg: string;
}

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A card: the library-generated marker with the component label and marker id underneath. */
export function buildCardSvg(card: CardSource): string {
  // Place the generated marker (square, with its own white quiet zone) as a nested <svg>.
  const nested = card.markerSvg.replace('<svg xmlns="http://www.w3.org/2000/svg"', '<svg x="10" y="10" width="100" height="100"');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="120mm" height="150mm" role="img" aria-label="${escapeXml(card.label)} marker card">` +
    `<rect width="120" height="150" fill="white" stroke="#444" stroke-width="0.5"/>` +
    nested +
    `<text x="60" y="130" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="black">${escapeXml(card.label)}</text>` +
    `<text x="60" y="143" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#333">ArUco id ${card.markerId}</text>` +
    `</svg>`
  );
}

export const PRINT_INSTRUCTIONS = [
  'Print this page at 100% scale (no "fit to page"), on white paper, in black ink.',
  'Cut out each card. Keep the white border around the black square.',
  'Use matte paper. Glossy paper causes glare that hides the marker.',
  'Hold each card flat and well lit, facing the camera, about 20 to 40 cm away.',
  'Removing a card from the camera view takes that component down. Bringing it back restores it.',
  'Physical mode is implemented but not hardware-verified.',
];

export function buildPrintSheet(cards: CardSource[]): string {
  const items = cards
    .map((c) => `<figure><img src="${escapeXml(c.id)}.svg" alt="${escapeXml(c.label)} marker card, ArUco id ${c.markerId}" /><figcaption>${escapeXml(c.label)}</figcaption></figure>`)
    .join('\n');
  const steps = PRINT_INSTRUCTIONS.map((s) => `<li>${escapeXml(s)}</li>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>PaperFault marker cards</title>
<style>
body { font-family: system-ui, sans-serif; margin: 1.5rem; color: #111; }
.cards { display: grid; grid-template-columns: repeat(2, 120mm); gap: 8mm; }
figure { margin: 0; break-inside: avoid; }
img { width: 120mm; height: 150mm; display: block; }
figcaption { position: absolute; width: 1px; height: 1px; overflow: hidden; }
@media print { .instructions { display: none; } }
</style>
</head>
<body>
<h1>PaperFault marker cards</h1>
<div class="instructions">
<h2>Print instructions</h2>
<ol>
${steps}
</ol>
<p><a href="/lab?mode=physical">Open physical mode</a> or <a href="/lab?mode=digital">use the Digital Lab (no camera)</a>.</p>
</div>
<div class="cards">
${items}
</div>
</body>
</html>
`;
}
