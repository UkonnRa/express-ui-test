<template>
  <el-config-provider :locale="elLocale">
    <router-view v-if="route.meta.isRaw"></router-view>
    <AppScaffold v-else></AppScaffold>
  </el-config-provider>
</template>

<script setup lang="ts">
import { AppScaffold } from "@white-rabbit/components";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import en from "element-plus/lib/locale/lang/en";

const route = useRoute();
const { locale } = useI18n();
const elLocale = computed(() => {
  if (locale.value === "zhHans") {
    return zhCn;
  } else {
    return en;
  }
});
</script>
