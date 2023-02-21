const path = require("path");
const { app, dialog, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");
const isDev = require("electron-is-dev");

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
        autoHideMenuBar: true,
    })

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3004'
            : `file://${path.join(__dirname, '../build/index.html')}`
    )

    if (isDev) {
        mainWindow.webContents.openDevTools({ mode: "detach" });
    }

    autoUpdater.checkForUpdates();
};

app.whenReady().then(() => {
    createWindow();

    if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates();
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Ok'],
        title: 'Update Available',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version download started. The app will be restarted to install the update.'
    };
    dialog.showMessageBox(dialogOpts);
})

autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };

    autoUpdater.quitAndInstall();

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
});