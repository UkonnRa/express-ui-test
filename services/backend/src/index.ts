import express from 'express';
import winston from 'winston';
import { Server } from 'http';
import { Account, AccountType, Strategy, Journal, Role, User } from '@white-rabbit/business-logic';
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
  app.disable('x-powered-by');
  const orm = await MikroORM.init(mikroConfig);
  const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
  });

  const cleanUpOrm = async () => {
    const accounts = await orm.em.find(Account, {}, ['inventory.values']);
    orm.em.remove(accounts);

    const journals = await orm.em.find(Journal, {}, ['records']);
    orm.em.remove(journals);

    const users = await orm.em.find(User, {});
    orm.em.remove(users);

    await orm.em.flush();
  };

  try {
    app.get('/journals', async (_req, resp) => {
      await cleanUpOrm();

      const user = new User({
        name: 'user 1',
        role: Role.ADMIN,
      });

      const journal = new Journal({
        name: 'Journal 2',
        admins: {
          type: 'ITEMS',
          items: [
            {
              type: 'USER',
              user,
            },
          ],
        },
        members: {
          type: 'USERS',
          users: [user],
        },
        records: [
          {
            user,
            timestamp: new Date(Date.UTC(2022, 0, 1)),
          },
        ],
        accounts: [
          {
            name: 'account 1',
            type: AccountType.ASSET,
            unit: 'USD',
            strategy: Strategy.AVERAGE,
          },
        ],
      });
      await orm.em.persistAndFlush([journal]);

      const afterSaving = await orm.em.find(Journal, {}, ['admins.items', 'members.items', 'records']);

      resp.json(afterSaving);
    });

    const server = app.listen(process.env.PORT, () => {
      logger.info(`Express starts on port ${process.env.PORT}`);
    });

    const shutdown = (signal: string, value: number) => {
      logger.info('Start gracefully shutdown!');
      server.close(() => {
        logger.info(`Process receive signal ${signal} with value ${value}`);
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
