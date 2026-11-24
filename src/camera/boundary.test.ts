import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (p: string) => readFileSync(p, 'utf8');
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));

/** Static imports and re-exports, excluding `import type` (erased at build time). */
const runtimeImports = (src: string) =>
  [...src.matchAll(/^\s*(?:import|export)\s+(?!type\b)[^;]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);

describe('import boundary (R3, R4)', () => {
  const camera = files('src/camera').filter((f) => /\.tsx?$/.test(f) && !/\.test\.ts$/.test(f) && !f.endsWith('.d.ts'));

  it('src/camera has no runtime import of the simulation (type imports only)', () => {
    expect(camera.length).toBeGreaterThan(0);
    for (const f of camera) {
      const bad = runtimeImports(read(f)).filter((s) => /simulation/.test(s));
      expect(bad, f).toEqual([]);
    }
  });

  it('adapter.ts imports neither React nor the mapping, and loads js-aruco2 only dynamically', () => {
    const src = read('src/camera/adapter.ts');
    const imports = runtimeImports(src);
    expect(imports.filter((s) => /react|mapping|js-aruco2/.test(s))).toEqual([]);
    expect(src).toContain("import('js-aruco2')");
  });

  it('only Lab reaches camera code, and only through a dynamic import', () => {
    const others = files('src').filter(
      (f) => /\.tsx?$/.test(f) && !f.startsWith('src/camera') && !/\.test\.ts$/.test(f),
    );
    for (const f of others) {
      const staticCamera = runtimeImports(read(f)).filter((s) => /camera/.test(s));
      expect(staticCamera, f).toEqual([]);
    }
    const users = others.filter((f) => /import\(['"][^'"]*camera/.test(read(f)));
    expect(users).toEqual([join('src', 'lab', 'Lab.tsx')]);
  });

  it('CameraPanel loads the adapter only by dynamic import', () => {
    const src = read('src/camera/CameraPanel.tsx');
    expect(runtimeImports(src).filter((s) => /adapter/.test(s))).toEqual([]);
    expect(src).toContain("import('./adapter')");
  });
});
