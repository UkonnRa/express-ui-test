import path from "path";
import { inject, singleton } from "tsyringe";
import { Logger } from "winston";
import { app, BrowserWindow, ipcMain } from "electron";
import isDev from "electron-is-dev";
import { Role, User } from "@white-rabbit/business-logic/src/domains/user";
import AuthUser from "@white-rabbit/business-logic/src/shared/auth-user";
import {
  JournalRepository,
  JournalService,
} from "@white-rabbit/business-logic/src/domains";

@singleton()
export default class App {
  constructor(
    @inject("Logger") private readonly logger: Logger,
    @inject("JournalRepository")
    private readonly journalRepository: JournalRepository,
    @inject(JournalService) private readonly journalService: JournalService
  ) {}

  async start(): Promise<void> {
    await app.whenReady();

    if (BrowserWindow.getAllWindows().length === 0) {
      this.logger.info("when ready: create window");
      await App.createWindow();
    }

    app.removeAllListeners("activate");
    app.on("activate", () => {
      const handle = async (): Promise<void> => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        this.logger.info(
          "windows length: ",
          BrowserWindow.getAllWindows().length
        );
        if (BrowserWindow.getAllWindows().length === 0) {
          this.logger.info("create window");
          await App.createWindow();
        }
      };
      void handle();
    });

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.removeAllListeners("window-all-closed");
    app.on("window-all-closed", () => {
      const handle = async (): Promise<void> => {
        this.logger.info("window-all-closed event");
        if (process.platform !== "darwin") app.quit();
      };
      void handle();
    });

    // In this file you can include the rest of your app's specific main process
    // code. You can also put them in separate files and require them here.
    ipcMain.removeHandler("business-logic");
    ipcMain.handle("business-logic", async () => {
      this.logger.info("start parsing ipc event");
      const id = await this.journalService.createJournal(
        new AuthUser(
          { id: "authId", provider: "provider" },
          ["journals:write"],
          new User({ name: "name desktop", role: Role.OWNER })
        ),
        {
          type: "JournalCommandCreate",
          name: "Journal Name",
          description: "Journal Desc",
          admins: [],
          members: [],
        }
      );

      this.logger.info("Journal id: " + id);

      const result = await this.journalRepository.findById(id);

      return JSON.stringify(
        {
          id: result?.id,
          name: result?.name,
          description: result?.description,
        },
        null,
        2
      );
    });
  }

  private static async createWindow(): Promise<void> {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    await mainWindow.loadURL(
      isDev
        ? "http://localhost:3000/"
        : `file://${path.join(__dirname, "index.html")}`
    );
  }
}
