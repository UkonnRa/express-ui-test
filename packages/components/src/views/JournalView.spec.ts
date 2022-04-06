import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import JournalView from "./JournalView.vue";

describe("journal-list", () => {
  it("can be mounted", () => {
    const wrapper = mount(JournalView);
    expect(wrapper.text()).toContain("WhiteRabbit");
  });
});
