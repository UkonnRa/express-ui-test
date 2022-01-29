import { Options } from '@mikro-orm/core/utils';
import { entities } from './entities';

const defineOrmConfig = (options: Options): Options => ({
  ...options,
  entities,
  discovery: { disableDynamicFileAccess: true },
  debug: process.env.NODE_ENV !== 'production',
});

export default defineOrmConfig;
