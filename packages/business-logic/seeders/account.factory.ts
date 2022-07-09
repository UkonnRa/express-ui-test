import { Factory, Faker } from "@mikro-orm/seeder";
import { Constructor, EntityData } from "@mikro-orm/core";
import { AccountStrategyValue, AccountTypeValue } from "@white-rabbit/types";
import { AccountEntity } from "../src/account";

const randomType = (): AccountTypeValue => {
  const random = Math.random();
  if (random < 0.2) {
    return AccountTypeValue.ASSET;
  } else if (random < 0.4) {
    return AccountTypeValue.INCOME;
  } else if (random < 0.6) {
    return AccountTypeValue.EQUITY;
  } else if (random < 0.8) {
    return AccountTypeValue.EXPENSE;
  } else {
    return AccountTypeValue.LIABILITY;
  }
};

export default class AccountFactory extends Factory<AccountEntity> {
  protected definition(faker: Faker): EntityData<AccountEntity> {
    return {
      name: `${faker.finance.transactionType()}:${faker.finance.account()}:${faker.finance.accountName()}`,
      description: faker.lorem.sentence(),
      type: randomType(),
      strategy:
        Math.random() < 0.5
          ? AccountStrategyValue.AVERAGE
          : AccountStrategyValue.FIFO,
      unit: faker.finance.currencyCode(),
      archived: Math.random() < 0.2,
    };
  }

  readonly model: Constructor<AccountEntity> = AccountEntity;
}
