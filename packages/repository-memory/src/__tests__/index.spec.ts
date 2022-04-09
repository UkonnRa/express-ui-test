import "reflect-metadata";
import { container } from "tsyringe";
import {
  UserSuite,
  GroupSuite,
  JournalSuite,
} from "@white-rabbit/test-suite/src/suite";
import { initMemoryRepositories } from "../index";

describe("Repository:Memory Integration Test", () => {
  void initMemoryRepositories();
  describe("can run user suite", () => {
    const suite = container.resolve(UserSuite);
    suite.start();
  });
  describe("can run group suite", () => {
    const suite = container.resolve(GroupSuite);
    suite.start();
  });
  describe("can run journal suite", () => {
    const suite = container.resolve(JournalSuite);
    suite.start();
  });
});
