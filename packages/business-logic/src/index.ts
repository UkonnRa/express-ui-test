import winston from "winston";
import { container } from "tsyringe";

export * from "./domains/account";
export * from "./domains/fin-record";
export * from "./domains/group";
export * from "./domains/journal";
export * from "./domains/user";
export * from "./domains";

export { default as AbstractEntity } from "./shared/abstract-entity";
export * from "./shared/abstract-repository";
export { default as AbstractService } from "./shared/abstract-service";
export * from "./shared/auth-user";
export * from "./shared/errors";

export * from "./utils";

export const initService = async (): Promise<void> => {
  const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
  });

  container.register("Logger", { useValue: logger });
};
