const { app, BrowserWindow } = require("electron");
const { exec } = require("child_process");
const http = require("http");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL("http://localhost:3000");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function waitForServerAndStartElectron() {
  const interval = setInterval(() => {
    http.get("http://localhost:3000", (res) => {
      if (res.statusCode === 200) {
        clearInterval(interval);
        createWindow();
      }
    }).on("error", () => {
      console.log("Czekam na uruchomienie serwera...");
    });
  }, 1000);
}

app.whenReady().then(() => {
  const serverProcess = exec("npm start", (error, stdout, stderr) => {
    if (error) {
      console.error(`Błąd uruchamiania serwera: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Błąd serwera: ${stderr}`);
      return;
    }
    console.log(`Serwer Express: ${stdout}`);
  });

  waitForServerAndStartElectron();

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
    serverProcess.kill();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});