import { defineOrmConfig } from '@white-rabbit/business-logic';

export default defineOrmConfig({
  dbName: 'white-rabbit',
  type: 'postgresql',
  clientUrl: process.env.WHITERABBIT_DATABASE_URL ?? 'postgresql://postgres:test1234@localhost:5432/white-rabbit',
});
