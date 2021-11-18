import { User } from '@white-rabbit/business-logic';
import { Options } from '@mikro-orm/core/utils';

const config: Options = {
  entities: [User],
  dbName: 'white-rabbit.db',
  type: 'sqlite',
  discovery: { disableDynamicFileAccess: true },
};

export default config;
