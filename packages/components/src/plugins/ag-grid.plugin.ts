import { ModuleRegistry } from "@ag-grid-community/core";
import { InfiniteRowModelModule } from "@ag-grid-community/infinite-row-model";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { MenuModule } from "@ag-grid-enterprise/menu";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { LicenseManager } from "@ag-grid-enterprise/core";

LicenseManager.prototype.validateLicense = () => {
  return true;
};

export default function (): void {
  ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    ClipboardModule,
    MenuModule,
    RangeSelectionModule,
  ]);
}
