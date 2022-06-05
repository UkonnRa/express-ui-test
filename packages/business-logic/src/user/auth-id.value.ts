import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export default class AuthIdValue {
  @Property()
  provider: string;

  @Property()
  value: string;

  constructor(provider: string, value: string) {
    this.provider = provider;
    this.value = value;
  }
}
