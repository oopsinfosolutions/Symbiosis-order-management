console.log("Electron main process started");

const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let backendProcess;

function createWindow() {
  console.log("Creating window...");
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const isDev = !app.isPackaged;

  const frontendURL = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "frontend", "build", "index.html").replace(/\\/g, "/")}`;

  console.log("Loading frontend from:", frontendURL);
  win.loadFile(path.join(__dirname, "frontend", "build", "index.html"));


  win.on("ready-to-show", () => {
    win.show();
  });
win.webContents.openDevTools();

  if (isDev) {
    win.webContents.openDevTools();
  }
}

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

app.whenReady().then(() => {
  console.log("App is ready");

  const backendPath = path.join(__dirname, "backend");
  const isDev = !app.isPackaged;

  if (isDev) {
    console.log("Starting backend process...");
    backendProcess = spawn("node", ["server.js"], {
      cwd: backendPath,
      shell: true,
    });

    backendProcess.stdout.on("data", (data) => {
      console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on("data", (data) => {
      console.error(`Backend Error: ${data}`);
    });

    backendProcess.on("close", (code) => {
      console.log(`Backend exited with code ${code}`);
    });
  }

  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    console.log("Killing backend process...");
    backendProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});
