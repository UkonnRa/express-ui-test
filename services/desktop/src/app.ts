import { inject, singleton } from 'tsyringe';
import { Logger } from 'winston';
import { JournalRepository, JournalService } from '@white-rabbit/business-logic/src/domains/journal';
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { Role, User } from '@white-rabbit/business-logic/src/domains/user';
import AuthUser from '@white-rabbit/business-logic/src/shared/auth-user';

@singleton()
export default class App {
  constructor(
    @inject('Logger') private readonly logger: Logger,
    @inject('JournalRepository') private readonly journalRepository: JournalRepository,
    private readonly journalService: JournalService,
  ) {}

  async start() {
    await app.whenReady();

    if (BrowserWindow.getAllWindows().length === 0) {
      this.logger.info('when ready: create window');
      await App.createWindow();
    }

    app.removeAllListeners('activate');
    app.on('activate', async () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      this.logger.info('windows length: ', BrowserWindow.getAllWindows().length);
      if (BrowserWindow.getAllWindows().length === 0) {
        this.logger.info('create window');
        await App.createWindow();
      }
    });

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.removeAllListeners('window-all-closed');
    app.on('window-all-closed', async () => {
      this.logger.info('window-all-closed event');
      if (process.platform !== 'darwin') app.quit();
    });

    // In this file you can include the rest of your app's specific main process
    // code. You can also put them in separate files and require them here.
    ipcMain.removeHandler('business-logic');
    ipcMain.handle('business-logic', async () => {
      this.logger.info('start parsing ipc event');
      const id = await this.journalService.createJournal(
        new AuthUser(
          { id: 'authId', provider: 'provider' },
          ['journals:write'],
          new User({ name: 'name desktop', role: Role.OWNER }),
        ),
        {
          type: 'CreateJournal',
          name: 'Journal Name',
          description: 'Journal Desc',
          admins: [],
          members: [],
        },
      );

      this.logger.info('Journal id: ', id);

      const result = await this.journalRepository.findById(id);

      this.logger.info('Journal: ', result);

      return JSON.stringify(result, null, 2);
    });

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(async () => {
        try {
          await this.journalRepository.close();
          this.logger.info('ORM closed gracefully');
        } catch (err) {
          this.logger.error('Error when graceful shutdown: ', err);
        }
      });
    }
  }

  private static async createWindow() {
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

    await mainWindow.loadURL(isDev ? 'http://localhost:4000/journals' : `file://${path.join(__dirname, 'index.html')}`);
  }
}
