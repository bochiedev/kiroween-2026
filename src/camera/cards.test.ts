import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { COMPONENT_IDS } from '../simulation/types';
import { buildCardSvg, buildPrintSheet } from './cards';
import { MARKER_IDS } from './markers';

const require = createRequire(import.meta.url);
const { AR } = require('js-aruco2') as typeof import('js-aruco2');
const dictionary = new AR.Dictionary('ARUCO');

/** Rasterises the library's marker SVG (9x9 unit grid) into RGBA pixels on a grey background. */
function rasterise(svg: string, scale: number, pad: number) {
  const units = 9;
  const size = units * scale + pad * 2;
  const data = new Uint8ClampedArray(size * size * 4).fill(128);
  const paint = (x: number, y: number, w: number, h: number, v: number) => {
    for (let py = y * scale; py < (y + h) * scale; py++)
      for (let px = x * scale; px < (x + w) * scale; px++) {
        const i = ((py + pad) * size + px + pad) * 4;
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 255;
      }
  };
  for (const m of svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="(white|black)"\/>/g)) {
    paint(+m[1], +m[2], +m[3], +m[4], m[5] === 'white' ? 255 : 0);
  }
  return { width: size, height: size, data } as unknown as ImageData;
}

describe('printable cards (R6)', () => {
  it('committed card files match what the generator produces from the library dictionary', () => {
    for (const id of COMPONENT_IDS) {
      const markerId = MARKER_IDS[id];
      const label = id === 'api' ? 'API' : id[0].toUpperCase() + id.slice(1);
      const expected = buildCardSvg({ id, label, markerId, markerSvg: dictionary.generateSVG(markerId) });
      expect(readFileSync(`public/cards/${id}.svg`, 'utf8')).toBe(expected);
    }
  });

  it('every card has its label and the print sheet has instructions and all four cards', () => {
    const sheet = readFileSync('public/cards/index.html', 'utf8');
    expect(sheet).toContain('Print instructions');
    for (const id of COMPONENT_IDS) {
      expect(sheet).toContain(`${id}.svg`);
      expect(readFileSync(`public/cards/${id}.svg`, 'utf8')).toContain(`ArUco id ${MARKER_IDS[id]}`);
    }
    expect(sheet).toContain('not hardware-verified');
    expect(buildPrintSheet([])).toContain('Print instructions');
  });
});

describe('js-aruco2 round trip (synthetic image, no camera)', () => {
  it('the library detects each of the four generated markers with the expected id', () => {
    const detector = new AR.Detector({ dictionaryName: 'ARUCO' });
    for (const id of COMPONENT_IDS) {
      const found = detector.detect(rasterise(dictionary.generateSVG(MARKER_IDS[id]), 12, 40));
      expect(found.map((m) => m.id)).toEqual([MARKER_IDS[id]]);
    }
  });
});
