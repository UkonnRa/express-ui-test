<template>
  <a-button type="primary" @click="onThemeChanged">WhiteRabbit</a-button>
  <a-button>Default Button</a-button>
  <a-button type="dashed">Dashed Button</a-button>
  <a-button type="text">Text Button</a-button>
  <a-button type="link">Link Button</a-button>
  Count: {{ cnt }}
</template>

<script setup lang="ts">
import { ConfigProvider } from "ant-design-vue";

const cnt = ref(0);
const theme = ["#25b864", "#ff0000", "#00ff00"];

const onThemeChanged = () => {
  cnt.value++;
  ConfigProvider.config({
    theme: {
      primaryColor: theme[cnt.value % theme.length],
    },
  });
};
</script>

<style scoped lang="less"></style>
