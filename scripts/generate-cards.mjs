// Generates public/cards/*.svg and public/cards/index.html from the js-aruco2 ARUCO dictionary.
// Run: npm run cards   (Node 22.18+ strips the TypeScript types natively.)
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCardSvg, buildPrintSheet } from '../src/camera/cards.ts';
import { MARKER_IDS } from '../src/camera/markers.ts';

const require = createRequire(import.meta.url);
const { AR } = require('js-aruco2');
const dictionary = new AR.Dictionary('ARUCO');

const LABELS = { api: 'API', queue: 'Queue', worker: 'Worker', database: 'Database' };
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'cards');
mkdirSync(out, { recursive: true });

const cards = Object.entries(MARKER_IDS).map(([id, markerId]) => ({
  id,
  label: LABELS[id],
  markerId,
  markerSvg: dictionary.generateSVG(markerId),
}));
for (const card of cards) writeFileSync(join(out, `${card.id}.svg`), buildCardSvg(card));
writeFileSync(join(out, 'index.html'), buildPrintSheet(cards));
console.log(`Wrote ${cards.length} cards and index.html to ${out}`);
