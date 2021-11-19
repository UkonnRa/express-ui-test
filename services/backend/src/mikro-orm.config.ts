import { User } from '@white-rabbit/business-logic';
import { Options } from '@mikro-orm/core/utils';

const config: Options = {
  entities: [User],
  dbName: 'white-rabbit',
  type: 'postgresql',
  clientUrl: process.env.WHITERABBIT_DATABASE_URL ?? 'postgresql://postgres:test1234@localhost:5432/white-rabbit',
  discovery: { disableDynamicFileAccess: true },
};

export default config;
