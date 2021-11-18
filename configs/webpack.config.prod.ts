import webpack, { IgnorePlugin } from 'webpack';
import mikroCore from '@mikro-orm/core/package.json';
import base from './webpack.config.base';
import path from 'path';
import { devDependencies } from '../package.json';

const externals: Record<string, string> = {};

for (const devDependency of [...Object.keys(devDependencies)]) {
  externals[devDependency] = `commonjs ${devDependency}`;
}

for (const devDependency of Object.keys(require(path.resolve(process.cwd(), 'package.json')).devDependencies)) {
  externals[devDependency] = `commonjs ${devDependency}`;
}

externals['sqlite3'] = 'commonjs sqlite3';

// And anything MikroORM's packaging can be ignored if it's not on disk.
// Later we check these dynamically and tell webpack to ignore the ones we don't have.
const optionalModules = new Set([
  ...Object.keys(require('knex/package.json').browser),
  ...Object.keys(mikroCore.peerDependencies),
  'pg-native',
  'sqlite3',
]);

const config: webpack.Configuration = {
  ...base,
  mode: 'production',
  externals,
  plugins: [
    new IgnorePlugin({
      checkResource: (resource) => {
        if (optionalModules.has(resource.split('/', resource[0] === '@' ? 2 : 1).join('/'))) {
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
