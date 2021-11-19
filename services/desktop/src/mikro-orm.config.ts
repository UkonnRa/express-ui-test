import { User } from '@white-rabbit/business-logic';
import { Options } from '@mikro-orm/core/utils';
import path from 'path';

const config: Options = {
  entities: [User],
  dbName: path.join(process.cwd(), 'white-rabbit.db'),
  type: 'sqlite',
  discovery: { disableDynamicFileAccess: true },
};

export default config;
