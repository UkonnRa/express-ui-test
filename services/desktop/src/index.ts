import 'reflect-metadata';
import { initService } from '@white-rabbit/business-logic';
import { container } from 'tsyringe';
import path from 'path';
import App from './app';

initService({
  dbName: path.join(process.cwd(), 'white-rabbit.db'),
  type: 'sqlite',
}).then(() => {
  const app = container.resolve(App);
  return app.start();
});
