import { Options } from '@mikro-orm/core/utils';
import { User } from './entities';

export * from './entities';

export const defineOrmConfig = (options: Options): Options => ({
  ...options,
  entities: [User],
  discovery: { disableDynamicFileAccess: true },
});
