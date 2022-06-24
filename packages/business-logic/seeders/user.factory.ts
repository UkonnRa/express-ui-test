import { Factory, Faker } from "@mikro-orm/seeder";
import { Constructor, EntityData } from "@mikro-orm/core";
import { v4 } from "uuid";
import { RoleValue, UserEntity } from "../src";

export default class UserFactory extends Factory<UserEntity> {
  private static randomRole(): RoleValue {
    const value = Math.random();
    if (value < 0.2) {
      return RoleValue.OWNER;
    } else if (value < 0.5) {
      return RoleValue.ADMIN;
    } else {
      return RoleValue.USER;
    }
  }

  protected definition(faker: Faker): EntityData<UserEntity> {
    return {
      name: faker.unique(faker.name.findName),
      role: UserFactory.randomRole(),
      authIds: Object.fromEntries(
        faker.helpers
          .uniqueArray(faker.company.bs, 2)
          .map((provider) => [provider, v4()])
      ),
    };
  }

  readonly model: Constructor<UserEntity> = UserEntity;
}
