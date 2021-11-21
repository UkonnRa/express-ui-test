import { execAsync, sleep } from './utils';

const main = async () => {
  await Promise.all([
    execAsync('render', 'npm run dev -w @white-rabbit/desktop-render'),
    execAsync('desktop:webpack', 'npm run dev:webpack -w @white-rabbit/desktop'),
    sleep(5_000).then(() => execAsync('desktop:electron', 'npm run dev:electron -w @white-rabbit/desktop')),
  ]);
};

main();
