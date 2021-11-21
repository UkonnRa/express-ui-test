import { exec } from 'child_process';

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const execAsync = async (tag: string, command: string) => {
  const child = exec(command);
  child.stdout?.on('data', (data) => {
    console.log(`[${tag}] stdout: ${data}`);
  });
  child.stderr?.on('data', (data) => {
    console.log(`[${tag}] stderr: ${data}`);
  });
  child.on('close', (code) => {
    console.log(`[${tag}] closing code: ${code}`);
  });
};

const main = async () => {
  await Promise.all([
    execAsync('render', 'npm run dev -w @white-rabbit/desktop-render'),
    execAsync('desktop:webpack', 'npm run dev:webpack -w @white-rabbit/desktop'),
    sleep(5_000).then(() => execAsync('desktop:electron', 'npm run dev:electron -w @white-rabbit/desktop')),
  ]);
};

main();
