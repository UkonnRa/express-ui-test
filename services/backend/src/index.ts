import 'reflect-metadata';
import { container } from 'tsyringe';
import { initService } from '@white-rabbit/business-logic';
import App from './app';

initService({
  dbName: 'white-rabbit',
  type: 'postgresql',
  clientUrl: process.env.WHITERABBIT_DATABASE_URL ?? 'postgresql://postgres:test1234@localhost:5432/white-rabbit',
}).then(() => {
  const app = container.resolve(App);

  return app.start();
});
