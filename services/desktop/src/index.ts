import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { MikroORM } from '@mikro-orm/core';
import winston from 'winston';
import { Role, User } from '@white-rabbit/business-logic';
import mikroConfig from './mikro-orm.config';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'index.html')}`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

let orm: MikroORM | null = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  orm = await MikroORM.init(mikroConfig);
  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();

  if (BrowserWindow.getAllWindows().length === 0) {
    logger.info('when ready: create window');
    createWindow();
  }

  app.removeAllListeners('activate');
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    logger.info('windows length: ', BrowserWindow.getAllWindows().length);
    if (BrowserWindow.getAllWindows().length === 0) {
      logger.info('create window');
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.removeAllListeners('window-all-closed');
app.on('window-all-closed', async () => {
  logger.info('window-all-closed event');
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.removeHandler('business-logic');
ipcMain.handle('business-logic', async () => {
  logger.info('start parsing ipc event');
  await orm?.em.persistAndFlush([new User(`name==!!!=test ${new Date()}`, Role.USER)]);
  return JSON.stringify(await orm?.em.find(User, {}), null, 2);
});

logger.info('yes!!');

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(async () => {
    try {
      await orm?.close(true);
      logger.info('ORM closed gracefully');
    } catch (err) {
      logger.error('Error when graceful shutdown: ', err);
    }
  });
}
