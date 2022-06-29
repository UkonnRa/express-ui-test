import { useDark as vueUseDark, useToggle } from "@vueuse/core";
import { useTheme } from "vuetify";
import { Ref, watchEffect } from "vue";

const isDark = vueUseDark();
const toggleDark = useToggle(isDark);

type UseDarkReturn = {
  readonly isDark: Ref<boolean>;
  readonly toggleDark: typeof toggleDark;
};

const useDark = (): UseDarkReturn => {
  const vuetifyTheme = useTheme();

  watchEffect(() => {
    vuetifyTheme.global.name.value = isDark.value ? "dark" : "light";
  });

  return {
    isDark,
    toggleDark,
  };
};

export default useDark;
