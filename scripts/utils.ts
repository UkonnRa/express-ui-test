/* eslint-disable no-console */
import { exec } from 'child_process';

export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const execAsync = async (tag: string, command: string) =>
  new Promise<void>((resolve, reject) => {
    const child = exec(command);
    child.stdout?.on('data', (data) => {
      console.log(`[${tag}] stdout: ${data}`);
    });
    child.stderr?.on('data', (data) => {
      console.error(`[${tag}] stderr: ${data}`);
    });
    child.on('close', (code) => {
      console.log(`[${tag}] closing code: ${code}`);
      resolve();
    });
    child.on('error', (err) => {
      reject(err);
    });
  });
