import "reflect-metadata";
import { container } from "tsyringe";
import { UserSuite } from "@white-rabbit/test-suite/src/suite";
import { initMemoryRepositories } from "../index";

describe("Repository:Memory Integration Test", () => {
  void initMemoryRepositories();
  describe("can run user suite", () => {
    const suite = container.resolve(UserSuite);
    suite.start();
  });
});
