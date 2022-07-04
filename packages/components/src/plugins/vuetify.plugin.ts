import {
  createVuetify,
  type ThemeDefinition,
  type VuetifyOptions,
} from "vuetify";
import "vuetify/styles";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";

const light: ThemeDefinition = {
  dark: false,
  colors: {
    background: "#fffbff",
    surface: "#fffbff",
    outline: "#827568",
    surfaceVariant: "#f0e0d0",

    primary: "#855400",
    secondary: "#8b13de",
    tertiary: "#3e6919",
    error: "#ba1a1a",
    info: "#5936f4",
  },
};

const dark: ThemeDefinition = {
  dark: true,
  colors: {
    background: "#1f1b16",
    surface: "#1f1b16",
    outline: "#9c8e80",
    surfaceVariant: "#504539",

    primary: "#ffb95d",
    secondary: "#e0b7ff",
    tertiary: "#a3d578",
    error: "#ffb4ab",
    info: "#c7bfff",
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
