import webpack, { IgnorePlugin } from 'webpack';
import mikroCore from '@mikro-orm/core/package.json';
import base from './webpack.config.base';

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
