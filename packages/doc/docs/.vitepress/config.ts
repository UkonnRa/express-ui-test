import { defineConfig } from "vitepress";
import plantuml from "markdown-it-plantuml";
import mathjax from "markdown-it-mathjax3";

const sidebarGuide = () => [
  {
    text: "Introduction",
    collapsible: true,
    items: [
      { text: "What is WhiteRabbit?", link: "/guide/what-is-white-rabbit" },
      {
        text: "Double-Entry Bookkeeping",
        link: "/guide/double-entry-bookkeeping",
      },
    ],
  },
];

const sidebarDesign = () => [
  {
    text: "Requirements & System",
    collapsible: true,
    items: [
      { text: "Use Cases", link: "/design/use-cases" },
      { text: "System Diagrams", link: "/design/system-diagrams" },
    ],
  },
  {
    text: "Key Features Design",
    collapsible: true,
    items: [
      {
        text: "Cursor-Based Pagination",
        link: "/design/cursor-based-pagination",
      },
      {
        text: "Soft Delete, or Not?",
        link: "/design/soft-delete-or-not",
      },
      {
        text: "Extendable Query System",
        link: "/design/extendable-query-system",
      },
    ],
  },
];

const customElements = ["mjx-container"];

export default defineConfig({
  lang: "en-US",
  title: "Wonderland WhiteRabbit",
  description:
    "Easy-to-use, precise but accurate bookkeeping system for daily usage.",

  lastUpdated: true,

  themeConfig: {
    nav: [
      {
        text: "Guides",
        link: "/guide/what-is-white-rabbit",
        activeMatch: "/guide/",
      },
      { text: "Designs", link: "/design/use-cases", activeMatch: "/design/" },
      {
        text: "Changelog",
        link: "https://github.com/alices-wonderland/white-rabbit/blob/main/CHANGELOG.md",
      },
    ],

    sidebar: {
      "/guide/": sidebarGuide(),
      "/design/": sidebarDesign(),
    },

    editLink: {
      repo: "alices-wonderland/white-rabbit",
      dir: "packages/docs",
      text: "Edit this page on GitHub",
    },

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/alices-wonderland/white-rabbit",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: `Copyright © 2021-${new Date().getFullYear()} Ukonn Ra`,
    },
  },

  markdown: {
    config: (md) => {
      md.use(plantuml);
      md.use(mathjax);
    },
  },

  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag),
      },
    },
  },
});
