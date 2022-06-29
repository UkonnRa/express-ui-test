<template>
  <ag-grid-vue
    :class="gridClass"
    style="height: 500px"
    :column-defs="columnDefs"
    :row-data="state"
    :default-col-def="defaultColDef"
    row-selection="multiple"
    animate-rows="true"
    :enable-range-selection="true"
    @grid-ready="onGridReady"
    @cell-clicked="deselectRows"
  >
  </ag-grid-vue>
</template>

<script setup lang="ts">
import { AgGridVue } from "@ag-grid-community/vue3";
import { computed, ref } from "vue";
import { useAsyncState } from "@vueuse/core";
import { ColDef, GridApi, GridReadyEvent } from "@ag-grid-community/core";
import { PriceCell } from "../components";
import { useDark } from "../hooks";

const { isDark } = useDark();
const gridClass = computed(() =>
  isDark.value ? "ag-theme-alpine-dark" : "ag-theme-alpine"
);

const gridApi = ref<GridApi>();
const onGridReady = (params: GridReadyEvent) => {
  gridApi.value = params.api;
};

const columnDefs = ref<ColDef[]>([
  { field: "make" },
  { field: "model" },
  { field: "price", cellRenderer: PriceCell },
]);

const defaultColDef = {
  sortable: true,
  filter: true,
};

const { state } = useAsyncState(
  fetch("https://www.ag-grid.com/example-assets/row-data.json").then((result) =>
    result.json()
  ),
  []
);

const deselectRows = () => {
  gridApi.value?.deselectAll();
};
</script>

<style lang="scss">
@import "@ag-grid-community/core/dist/styles/ag-grid";
@import "@ag-grid-community/core/dist/styles/ag-theme-alpine/sass/ag-theme-alpine";
@import "@ag-grid-community/core/dist/styles/ag-theme-alpine-dark/sass/ag-theme-alpine-dark";
</style>
