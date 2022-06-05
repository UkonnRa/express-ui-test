import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/core";
import UserFactory from "./user.factory";
import { RoleValue } from "../src/user";

export default class DefaultSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await new UserFactory(em).create(5, {
      role: RoleValue.OWNER,
    });
    await new UserFactory(em).create(8, {
      role: RoleValue.ADMIN,
    });
    await new UserFactory(em).create(13, {
      role: RoleValue.USER,
    });
  }
}
