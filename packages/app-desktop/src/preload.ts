import fs from "fs";
import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to Renderer-process. ---------
contextBridge.exposeInMainWorld("fs", fs);
contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);
