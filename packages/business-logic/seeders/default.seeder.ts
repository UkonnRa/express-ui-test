import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/core";
import { faker } from "@faker-js/faker";
import { RoleValue } from "../src";
import UserFactory from "./user.factory";
import GroupFactory from "./group.factory";
import JournalFactory from "./journal.factory";

export default class DefaultSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const users = await Promise.all([
      new UserFactory(em).create(5, {
        role: RoleValue.OWNER,
      }),
      new UserFactory(em).create(8, {
        role: RoleValue.ADMIN,
      }),
      new UserFactory(em).create(13, {
        role: RoleValue.USER,
      }),
      new UserFactory(em).create(13),
    ]).then((nested) => nested.flatMap((xs) => xs));

    const groups = new GroupFactory(em).make(20);
    groups.forEach((v) => {
      v.setAdmins(faker.helpers.arrayElements(users, 5));
      v.setMembers(faker.helpers.arrayElements(users, 13));
    });
    em.persist(groups);

    const journals = new JournalFactory(em).make(20);
    journals.forEach((v) => {
      v.setAccessItems(
        faker.helpers.arrayElements([...users, ...groups], 5),
        "admin"
      );
      v.setAccessItems(
        faker.helpers.arrayElements([...users, ...groups], 13),
        "member"
      );
    });
    em.persist(journals);
  }
}
