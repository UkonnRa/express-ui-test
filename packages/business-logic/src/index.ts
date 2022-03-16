import winston from "winston";
import { container } from "tsyringe";

export default async (): Promise<void> => {
  const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
  });

  container.register("Logger", { useValue: logger });
};
