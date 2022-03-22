<template>
  <v-app :theme="theme" class="scaffold">
    <v-btn @click="toggleTheme">Toggle Theme: Current {{ theme }}</v-btn>
    <Hello></Hello>
    <World></World>
    <div class="chip-group">
      <v-chip v-for="c in colors" :key="c" class="chip" :color="c">{{
        c
      }}</v-chip>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Hello from "./Hello.vue";
import World from "./World.vue";

const theme = ref("light");

const colors = ["primary", "secondary", "success", "warning", "error", "info"];

const toggleTheme = () =>
  (theme.value = theme.value === "light" ? "dark" : "light");
</script>

<style scoped lang="scss">
.scaffold {
  height: 100vh;
}

.chip-group {
  display: inline-block;

  .chip {
    margin-left: 5px;
  }
}
</style>
