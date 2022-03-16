import { inject, singleton } from "tsyringe";
import { Logger } from "winston";
import express, { Express, Request, Response } from "express";
import { Role, User } from "@white-rabbit/business-logic/src/domains/user";
import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";
import {
  JournalRepository,
  JournalService,
} from "@white-rabbit/business-logic/src/domains";

@singleton()
export default class App {
  private readonly app: Express;

  constructor(
    @inject("Logger") private readonly logger: Logger,
    @inject("JournalRepository")
    private readonly journalRepository: JournalRepository,
    private readonly journalService: JournalService
  ) {
    this.app = express();
    this.app.disable("x-powered-by");
  }

  async start(): Promise<void> {
    this.app.get("/", (_req: Request, res: Response) => {
      const handle = async (): Promise<void> => {
        const id = await this.journalService.createJournal(
          new AuthUser(
            { id: "authId", provider: "provider" },
            ["journals:write"],
            new User({ name: "name backend", role: Role.OWNER })
          ),
          {
            type: "CreateJournal",
            name: "Journal Name",
            description: "Journal Desc",
            admins: [],
            members: [],
          }
        );

        this.logger.info("Journal id: ", id);

        const result = await this.journalRepository.findById(id);

        this.logger.info("Journal: ", result);

        res.send(id);
      };
      void handle();
    });

    const server = this.app.listen(process.env.PORT, () => {
      this.logger.info(`Express starts on port ${String(process.env.PORT)}`);
    });

    const shutdown = (signal: string, value: number): void => {
      this.logger.info("Start gracefully shutdown!");
      server.close(() => {
        this.logger.info(
          `Process receive signal ${signal} with value ${value}`
        );
        process.exit(128 + value);
      });
    };

    Object.entries({ SIGHUP: 1, SIGINT: 2, SIGTERM: 15 }).forEach(
      ([signal, value]) => {
        process.on(signal, () => shutdown(signal, value));
      }
    );
  }
}
