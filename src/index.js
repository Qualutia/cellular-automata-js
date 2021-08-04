const { app, BrowserWindow } = require('electron');

const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 1080,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: "hidden",
    icon: __dirname + "./icons/app_icon.png",
    webPreferences: {
        // preload: path.join(__dirname, 'Preload'),
        enableRemoteModule: true,
        nodeIntegration: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});