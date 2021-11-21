import { copy } from 'fs-extra';
import { execAsync } from './utils';

const main = async () => {
  await execAsync('render', 'npm run build:desktop -w @white-rabbit/desktop-render');
  await copy('services/desktop-render/dist', 'services/desktop/app/dist');
  await execAsync('desktop', 'npm run build:desktop -w @white-rabbit/desktop');
};

main();
