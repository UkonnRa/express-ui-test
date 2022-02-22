import { copy, mkdir, pathExists } from 'fs-extra';
import { execAsync } from './utils';

const main = async () => {
  await execAsync('render', 'npm run build:desktop -w @white-rabbit/desktop-render');
  await copy('services/desktop-render/dist', 'services/desktop/dist');
  if (!(await pathExists('services/desktop/node_modules'))) {
    await mkdir('services/desktop/node_modules');
  }
  await execAsync('desktop', 'npm run build:desktop -w @white-rabbit/desktop');
};

main();
