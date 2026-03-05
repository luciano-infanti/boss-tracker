import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { scrapeAllWorlds } from './scraper';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a'
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('start-scraper', async (event) => {
  try {
     event.sender.send('scraper-log', { type: 'info', message: 'Initializing scraper engine...' });
     const results = await scrapeAllWorlds((logMsg, isError = false) => {
       event.sender.send('scraper-log', { type: isError ? 'error' : 'info', message: logMsg });
     });
     event.sender.send('scraper-done', results);
  } catch (err: any) {
     event.sender.send('scraper-error', err.message);
  }
});
