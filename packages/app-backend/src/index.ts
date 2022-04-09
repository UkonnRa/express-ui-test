import "reflect-metadata";
import { container } from "tsyringe";
import { initService } from "@white-rabbit/business-logic";
import { initMemoryRepositories } from "@white-rabbit/repository-memory";
import App from "./app";

void Promise.all([initMemoryRepositories(), initService()]).then(async () => {
  const app = container.resolve(App);
  return app.start();
});
