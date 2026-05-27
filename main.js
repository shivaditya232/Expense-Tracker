const { app, BrowserWindow } = require('electron');

function createWindow() {
    // Create the desktop window
    const win = new BrowserWindow({
        width: 1200,
        height: 750,
        minWidth: 900,
        minHeight: 600,
        title: 'Expense Tracker',
        webPreferences: {
            nodeIntegration: false
        }
    });

    // Load the main HTML file
    win.loadFile('index.html');
}

// When Electron is ready, create the window
app.whenReady().then(createWindow);

// Quit the app when all windows are closed (Windows/Linux)
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
