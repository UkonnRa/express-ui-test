import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/core";
import { faker } from "@faker-js/faker";
import { AccessItemAccessibleTypeValue, RoleValue } from "../src";
import UserFactory from "./user.factory";
import GroupFactory from "./group.factory";
import JournalFactory from "./journal.factory";
import AccountFactory from "./account.factory";

export default class DefaultSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const userFactory = new UserFactory(em);
    const accountFactory = new AccountFactory(em);

    const users = await Promise.all([
      userFactory.create(5, {
        role: RoleValue.OWNER,
      }),
      userFactory.create(8, {
        role: RoleValue.ADMIN,
      }),
      userFactory.create(13, {
        role: RoleValue.USER,
      }),
      userFactory.create(13),
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
        AccessItemAccessibleTypeValue.ADMIN
      );
      v.setAccessItems(
        faker.helpers.arrayElements([...users, ...groups], 13),
        AccessItemAccessibleTypeValue.MEMBER
      );
    });
    em.persist(journals);

    const accounts = journals.flatMap((journal) => {
      return accountFactory.make(8, {
        journal,
      });
    });
    em.persist(accounts);
  }
}
