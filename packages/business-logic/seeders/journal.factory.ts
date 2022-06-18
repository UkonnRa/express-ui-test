import { Factory, Faker } from "@mikro-orm/seeder";
import { Constructor, EntityData } from "@mikro-orm/core";
import { JournalEntity } from "../src";

export default class JournalFactory extends Factory<JournalEntity> {
  protected definition(faker: Faker): EntityData<JournalEntity> {
    return {
      name: faker.unique(faker.commerce.productName),
      description: faker.lorem.sentence(),
      tags: faker.helpers.uniqueArray(faker.commerce.product, 5),
      unit: faker.finance.currencyCode(),
      archived: Math.random() < 0.2,
      deletedAt: Math.random() < 0.2 ? faker.date.recent(10) : undefined,
    };
  }

  readonly model: Constructor<JournalEntity> = JournalEntity;
}
