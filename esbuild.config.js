const esbuild = require('esbuild');
const path = require('path');

/**
 *
 * @param dirname {string} __dirname for each project
 * @returns {Promise<void>}
 */
module.exports = async (dirname) => {
  try {
    await esbuild.build({
      entryPoints: [path.join(dirname, 'src/index.ts')],
      outfile: path.join(dirname, 'dist/index.js'),
      bundle: true,
      minify: true,
      platform: 'node',
      sourcemap: true,
      target: 'node16',
    });
  } catch (e) {
    process.exit(1);
  }
};
