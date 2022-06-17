import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UserCard from "./UserCard.vue";

describe("App.vue", () => {
  it("can be mounted", async () => {
    const wrapper = mount(UserCard);
    expect(wrapper.text()).toContain("User");
  });
});
