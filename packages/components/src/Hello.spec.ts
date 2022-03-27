import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Hello from "./Hello.vue";

describe("Hello.vue", () => {
  it("can be mounted", () => {
    const wrapper = mount(Hello);
    expect(wrapper.text()).toContain("Hello");
  });
});
