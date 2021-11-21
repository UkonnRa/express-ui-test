import { execSync } from 'child_process';
import { copySync } from 'fs-extra';

console.time('buildRenderResult');
const buildRenderResult = execSync('npm run build:desktop -w @white-rabbit/desktop-render');
console.timeEnd('buildRenderResult');
console.log('Build render result: ', buildRenderResult.toString());

copySync('services/desktop-render/dist', 'services/desktop/app/dist');

console.time('buildDesktopResult');
const buildDesktopResult = execSync('npm run build:desktop -w @white-rabbit/desktop');
console.timeEnd('buildDesktopResult');
console.log('Build desktop result: ', buildDesktopResult.toString());
