import { ModuleRegistry } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { MenuModule } from "@ag-grid-enterprise/menu";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { InfiniteRowModelModule } from "@ag-grid-community/infinite-row-model";

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
