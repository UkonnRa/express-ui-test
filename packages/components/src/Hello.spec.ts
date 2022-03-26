import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Hello from "./Hello.vue";
import { vuetifyConfig } from "./plugins";

describe("Hello.vue", () => {
  it("can be mounted", () => {
    const wrapper = mount(Hello, {
      global: {
        plugins: [vuetifyConfig],
      },
    });
    expect(wrapper.text()).toContain("Hello");
  });
});
