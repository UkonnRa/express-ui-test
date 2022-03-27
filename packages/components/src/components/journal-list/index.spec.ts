import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import JournalList from "./index.vue";

describe("journal-list", () => {
  it("can be mounted", () => {
    const wrapper = mount(JournalList);
    expect(wrapper.text()).toContain("Admins");
  });
});
