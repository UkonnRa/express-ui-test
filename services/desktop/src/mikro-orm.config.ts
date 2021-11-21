import { defineOrmConfig } from '@white-rabbit/business-logic';
import path from 'path';

export default defineOrmConfig({
  dbName: path.join(process.cwd(), 'white-rabbit.db'),
  type: 'sqlite',
});
