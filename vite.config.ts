import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * js-aruco2 is CommonJS that publishes through `this.AR` and `this.CV`. A bundler turns the
 * top-level `this` into `undefined`, so the exports vanish. Rewrite those three lines to `exports`.
 */
function jsAruco2Exports(): Plugin {
  return {
    name: 'js-aruco2-exports',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0].replace(/\\/g, '/');
      if (file.endsWith('/js-aruco2/src/cv.js')) return code.replace('this.CV = CV;', 'exports.CV = CV;');
      if (file.endsWith('/js-aruco2/src/aruco.js')) {
        return code.replace("this.CV || require('./cv').CV", "require('./cv').CV").replace('this.AR = AR;', 'exports.AR = AR;');
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [jsAruco2Exports(), react()],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'tests/**/*.test.ts'] },
});
