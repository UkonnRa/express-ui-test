import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../App.vue";

describe("App.vue", () => {
  it("can be mounted", () => {
    const wrapper = mount(App);
    expect(wrapper.find(".app-header--logo").text()).toContain("WhiteRabbit");
  });
});
