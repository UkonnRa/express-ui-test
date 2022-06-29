import {
  createVuetify,
  type ThemeDefinition,
  type VuetifyOptions,
} from "vuetify";
import "vuetify/styles/main.sass";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";

const light: ThemeDefinition = {
  dark: false,
  colors: {
    background: "#FFFBFE",
    surface: "#FFFBFE",
    primary: "#6750A4",
    secondary: "#625B71",
    success: "#006e18",
    warning: "#9b4601",
    error: "#B3261E",
    info: "#4038ff",
  },
};

const dark: ThemeDefinition = {
  dark: true,
  colors: {
    background: "#1C1B1F",
    surface: "#1C1B1F",
    primary: "#D0BCFF",
    secondary: "#CCC2DC",
    success: "#00e640",
    warning: "#ffb68a",
    error: "#F2B8B5",
    info: "#bfc1ff",
  },
};

export const vuetifyOptions: VuetifyOptions = {
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light,
      dark,
    },
  },
};

export default createVuetify(vuetifyOptions);
