<template>
  <v-btn>{{ props.params.value }}</v-btn>
</template>
<script setup lang="ts">
import { ICellRendererParams } from "@ag-grid-community/core";

const props = defineProps<{ params: ICellRendererParams }>();
</script>
