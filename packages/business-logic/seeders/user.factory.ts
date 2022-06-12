import { Factory, Faker } from "@mikro-orm/seeder";
import { Constructor, EntityData } from "@mikro-orm/core";
import { v4 } from "uuid";
import { RoleValue, UserEntity } from "../src";

const AUTH_PROVIDERS = ["Auth0", "Authing", "GitHub", "Google"];

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
      name: faker.name.findName(),
      role: UserFactory.randomRole(),
      authIds: faker.helpers
        .uniqueArray(AUTH_PROVIDERS, 2)
        .map((provider) => ({ provider, value: v4() })),
      deletedAt: Math.random() < 0.2 ? faker.date.recent(10) : undefined,
    };
  }

  readonly model: Constructor<UserEntity> = UserEntity;
}
