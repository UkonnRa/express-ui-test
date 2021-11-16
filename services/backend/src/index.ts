import express from 'express';
import winston from 'winston';
import { Server } from 'http';
import { Role, User } from '@white-rabbit/business-logic';
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
      await orm.em.persistAndFlush([new User(`name===test ${new Date()}`, Role.USER)]);
      resp.json(await orm.em.find(User, {}));
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
