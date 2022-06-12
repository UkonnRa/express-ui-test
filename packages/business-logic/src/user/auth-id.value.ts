import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export default class AuthIdValue {
  @Property({ type: "string" })
  provider: string;

  @Property({ type: "string" })
  value: string;

  constructor(provider: string, value: string) {
    this.provider = provider;
    this.value = value;
  }
}
