import webpack, { IgnorePlugin } from 'webpack';
import base from './webpack.config.base';
import { devDependencies } from '../package.json';
import mikroCore from '@mikro-orm/core/package.json';
import path from 'path';

const externals: Record<string, string> = {};

for (const devDependency of [...Object.keys(devDependencies)]) {
  externals[devDependency] = `commonjs ${devDependency}`;
}

for (const devDependency of Object.keys(require(path.resolve(process.cwd(), 'package.json')).devDependencies)) {
  externals[devDependency] = `commonjs ${devDependency}`;
}

// And anything MikroORM's packaging can be ignored if it's not on disk.
// Later we check these dynamically and tell webpack to ignore the ones we don't have.
const optionalModules = new Set([
  ...Object.keys(require('knex/package.json').browser),
  ...Object.keys(mikroCore.peerDependencies),
  'pg-native',
]);

const config: webpack.Configuration = {
  ...base,
  mode: 'production',
  externals,
  plugins: [
    new IgnorePlugin({
      checkResource: (resource) => {
        const baseResource = resource.split('/', resource[0] === '@' ? 2 : 1).join('/');

        if (optionalModules.has(baseResource)) {
          try {
            require.resolve(resource);
            return false;
          } catch {
            return true;
          }
        }

        return false;
      },
    }),
  ],
};
export default config;
