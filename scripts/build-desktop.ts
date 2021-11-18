import { execSync } from 'child_process';
import { copySync } from 'fs-extra';

execSync('npm run build:desktop -w @white-rabbit/desktop-render');
copySync('services/desktop-render/dist', 'services/desktop/dist');
execSync('npm run build:desktop -w @white-rabbit/desktop');
