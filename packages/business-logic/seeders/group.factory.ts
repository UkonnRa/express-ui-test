import { Factory, Faker } from "@mikro-orm/seeder";
import { Constructor, EntityData } from "@mikro-orm/core";
import { GroupEntity } from "../src/group";

export default class GroupFactory extends Factory<GroupEntity> {
  protected definition(faker: Faker): EntityData<GroupEntity> {
    return {
      name: faker.unique(faker.company.companyName),
      description: faker.lorem.sentence(),
      deletedAt: Math.random() < 0.2 ? faker.date.recent(10) : undefined,
    };
  }

  readonly model: Constructor<GroupEntity> = GroupEntity;
}
