import express from 'express';
import winston from 'winston';
import { Server } from 'http';
import {
  AccessList,
  Account,
  AccountType,
  InventoryAverage,
  InventoryFIFO,
  InventoryRecord,
  Role,
  User,
} from '@white-rabbit/business-logic';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';

const nodeCloseAsync = async (server: Server): Promise<void> =>
  new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

const main = async () => {
  const app = express();
  const orm = await MikroORM.init(mikroConfig);
  const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
  });

  try {
    app.get('/', async (_req, resp) => {
      const accounts = await orm.em.find(Account, {}, ['inventory.values']);
      orm.em.remove(accounts);
      const users = await orm.em.find(User, {});
      orm.em.remove(accounts);
      orm.em.remove(users);
      await orm.em.flush();

      const user = new User('user 1', Role.ADMIN);

      const account = new Account(
        'Stock Account for NVDA',
        AccessList.fromUsers([user]),
        new AccessList(),
        AccountType.ASSET,
        'NVDA',
      );
      account.inventory = new InventoryAverage(account, 10, 'USD', 500);

      const account2 = new Account(
        'Stock Account for AMD',
        AccessList.fromUsers([user]),
        new AccessList(),
        AccountType.ASSET,
        'AMD',
      );
      const inventory = new InventoryFIFO(account2);

      inventory.values.add(
        new InventoryRecord(new Date(Date.UTC(2022, 0, 1)), inventory, 20, 'USD', 100),
        new InventoryRecord(new Date(Date.UTC(2022, 1, 1)), inventory, 20, 'USD', 150),
        new InventoryRecord(new Date(Date.UTC(2022, 1, 1)), inventory, -52),
      );
      account2.inventory = inventory;

      await orm.em.persistAndFlush([account, account2]);

      const afterSavingAccount = await orm.em.find(Account, {}, ['admins.items', 'members.items', 'inventory.values']);

      resp.json(afterSavingAccount);
    });

    const server = app.listen(process.env.PORT, () => {
      logger.info(`Express starts on port ${process.env.PORT}`);
    });

    const shutdown = (signal: string, value: number) => {
      winston.info('Start gracefully shutdown!');
      server.close(() => {
        winston.info(`Process receive signal ${signal} with value ${value}`);
        process.exit(128 + value);
      });
    };

    Object.entries({ SIGHUP: 1, SIGINT: 2, SIGTERM: 15 }).forEach(([signal, value]) => {
      process.on(signal, () => shutdown(signal, value));
    });

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(async () => {
        try {
          await nodeCloseAsync(server);
          logger.info('Express server closed gracefully');
          await orm.close();
          logger.info('ORM closed gracefully');
        } catch (err) {
          logger.error('Error when graceful shutdown: ', err);
        }
      });
    }
  } catch (e) {
    logger.error('Error when starting up: ', e);
  }
};

main();
