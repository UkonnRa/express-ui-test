import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { Hello } from "@white-rabbit/components";

describe("App.vue", () => {
  it("can be mounted", () => {
    const wrapper = mount(Hello);
    expect(wrapper.text()).toContain("Hello");
  });
});
