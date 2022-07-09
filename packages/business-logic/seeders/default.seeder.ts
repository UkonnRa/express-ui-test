import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/core";
import { faker } from "@faker-js/faker";
import { RecordTypeValue, RoleValue } from "@white-rabbit/types";
import { AccessItemAccessibleTypeValue, RecordItemValue } from "../src";
import UserFactory from "./user.factory";
import GroupFactory from "./group.factory";
import JournalFactory from "./journal.factory";
import AccountFactory from "./account.factory";
import RecordFactory from "./record.factory";

export default class DefaultSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const userFactory = new UserFactory(em);
    const accountFactory = new AccountFactory(em);
    const recordFactory = new RecordFactory(em);

    const users = await Promise.all([
      userFactory.makeOne({
        name: "Wonderland Admin",
        role: RoleValue.ADMIN,
        authIds: {
          authing: "62b88497083e77d5faca3c29",
        },
      }),
      userFactory.makeOne({
        name: "Wonderland DisabledUser",
        role: RoleValue.USER,
        authIds: {
          authing: "62b9aa44030fd558ca2a13aa",
        },
      }),
      userFactory.makeOne({
        name: "Wonderland Owner",
        role: RoleValue.OWNER,
        authIds: {
          authing: "62b7e12becdff87b52da3296",
        },
      }),
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

    const records = journals.flatMap((journal) =>
      recordFactory.make(8, {
        journal,
      })
    );

    const price = (): number => Number((Math.random() * 200 - 100).toFixed(2));

    for (const record of records) {
      const availableAccounts = accounts.filter(
        (account) => account.journal.id === record.journal.id
      );
      // Valid checkers
      const acs = faker.helpers.arrayElements(availableAccounts, 3);
      if (Math.random() < 0.025) {
        const amount = records
          .filter(
            ({ timestamp }) => timestamp.valueOf() < record.timestamp.valueOf()
          )
          .flatMap((record) => record.items.getItems())
          .filter((item) => item.account.id === acs[0].id)
          .reduce((prev, curr) => prev + curr.amount, 0);
        record.type = RecordTypeValue.CHECK;
        record.items.set([new RecordItemValue(record, acs[0], amount)]);
      } else if (Math.random() < 0.05) {
        record.type = RecordTypeValue.CHECK;
        record.items.set([new RecordItemValue(record, acs[0], price())]);
      } else {
        record.items.set(
          acs.map(
            (account) =>
              new RecordItemValue(
                record,
                account,
                price(),
                account.unit === account.journal.unit ? undefined : price()
              )
          )
        );
      }
    }
    em.persist(records);
  }
}
