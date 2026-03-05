import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  startScraper: () => ipcRenderer.send('start-scraper'),
  onLog: (callback: (data: { type: string, message: string }) => void) => ipcRenderer.on('scraper-log', (_event, data) => callback(data)),
  onDone: (callback: (results: any) => void) => ipcRenderer.on('scraper-done', (_event, results) => callback(results)),
  onError: (callback: (errorMsg: string) => void) => ipcRenderer.on('scraper-error', (_event, errorMsg) => callback(errorMsg)),
});
