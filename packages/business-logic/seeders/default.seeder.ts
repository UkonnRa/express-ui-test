import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/core";
import UserFactory from "./user.factory";
import { RoleValue } from "../src/user";
import GroupFactory from "./group.factory";
import { faker } from "@faker-js/faker";

export default class DefaultSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const users = await Promise.all([
      new UserFactory(em).create(5, {
        role: RoleValue.OWNER,
        deletedAt: undefined,
      }),
      new UserFactory(em).create(8, {
        role: RoleValue.ADMIN,
        deletedAt: undefined,
      }),
      new UserFactory(em).create(13, {
        role: RoleValue.USER,
        deletedAt: undefined,
      }),
      new UserFactory(em).create(21),
    ]).then((nested) => nested.flatMap((xs) => xs));

    const groups = new GroupFactory(em).make(20);
    groups.forEach((v) => {
      v.setAdmins(faker.helpers.arrayElements(users, 5));
      v.setMembers(faker.helpers.arrayElements(users, 13));
    });
    em.persist(groups);
  }
}
