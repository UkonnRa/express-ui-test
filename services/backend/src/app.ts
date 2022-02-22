import { inject, injectable } from 'tsyringe';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Server } from 'http';
import { JournalRepository, JournalService } from '@white-rabbit/business-logic/src/domains/journal';
import { Role, User } from '@white-rabbit/business-logic/src/domains/user';
import AuthUser from '@white-rabbit/business-logic/src/shared/auth-user';

const nodeCloseAsync = (server: Server): Promise<void> =>
  new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

@injectable()
export default class App {
  private readonly app: Express;

  constructor(
    @inject('Logger') private readonly logger: Logger,
    @inject('JournalRepository') private readonly journalRepository: JournalRepository,
    private readonly journalService: JournalService,
  ) {
    this.app = express();
    this.app.disable('x-powered-by');
  }

  async start() {
    this.app.get('/', async (_req, res) => {
      const id = await this.journalService.createJournal(
        new AuthUser({ id: 'authId', provider: 'provider' }, ['journals:write'], new User('name', Role.OWNER)),
        {
          type: 'CreateJournal',
          name: 'Journal Name',
          description: 'Journal Desc',
          admins: [],
          members: [],
        },
      );

      this.logger.info('Journal id: ', id);

      const result = await this.journalRepository.findById(id);

      this.logger.info('Journal: ', result);

      res.send(id);
    });

    const server = this.app.listen(process.env.PORT, () => {
      this.logger.info(`Express starts on port ${process.env.PORT}`);
    });

    const shutdown = (signal: string, value: number) => {
      this.logger.info('Start gracefully shutdown!');
      server.close(() => {
        this.logger.info(`Process receive signal ${signal} with value ${value}`);
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
          this.logger.info('Express server closed gracefully');
          await this.journalRepository.close();
          this.logger.info('ORM closed gracefully');
        } catch (err) {
          this.logger.error('Error when graceful shutdown: ', err);
        }
      });
    }
  }
}
