console.log("Electron main process started");

const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

let backendProcess;
const isDev = !app.isPackaged;
const lanServerUrl = "http://192.168.0.111:5000"; // ✅ Replace with your LAN IP

function createWindow() {
  console.log("Creating window...");

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    const localPath = path.join(__dirname, "frontend", "build", "index.html");
    console.log("Development mode: loading from", localPath);
    win.loadFile(localPath);
    win.webContents.openDevTools();
  } else {
    console.log("Production mode: loading from LAN:", lanServerUrl);
    win.loadURL(lanServerUrl).catch(err => {
      console.error("Failed to load LAN server:", err);
      win.loadURL(`data:text/html,<h1 style='color:red;'>Cannot reach server</h1><p>${err.message}</p>`);
    });
  }

  win.once("ready-to-show", () => {
    win.show();
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL, 'Error:', errorDescription, 'Code:', errorCode);
  });

  win.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });
}

function startBackend() {
  if (!isDev) {
    console.log("Production mode - backend not started");
    return;
  }

  const backendPath = path.join(__dirname, "backend");
  const serverPath = path.join(backendPath, "server.js");

  if (!fs.existsSync(serverPath)) {
    console.error("server.js not found at:", serverPath);
    return;
  }

  backendProcess = spawn("node", ["server.js"], {
    cwd: backendPath,
    stdio: ["pipe", "pipe", "pipe"]
  });

  backendProcess.stdout.on("data", data => {
    console.log(`Backend: ${data.toString().trim()}`);
  });

  backendProcess.stderr.on("data", data => {
    console.error(`Backend Error: ${data.toString().trim()}`);
  });

  backendProcess.on("close", code => {
    console.log(`Backend exited with code ${code}`);
  });

  backendProcess.on("error", err => {
    console.error("Backend process error:", err);
  });
}

function stopBackend() {
  if (backendProcess) {
    console.log("Stopping backend...");
    try {
      backendProcess.kill("SIGTERM");
      setTimeout(() => {
        if (!backendProcess.killed) {
          backendProcess.kill("SIGKILL");
        }
      }, 3000);
    } catch (err) {
      console.error("Error stopping backend:", err);
    }
    backendProcess = null;
  }
}

// App lifecycle
app.whenReady().then(() => {
  console.log("App is ready. Packaged:", app.isPackaged);
  if (isDev) {
    startBackend();
  }
  createWindow();
});

app.on("window-all-closed", () => {
  stopBackend();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("before-quit", () => stopBackend());
app.on("will-quit", (event) => {
  if (backendProcess) {
    event.preventDefault();
    stopBackend();
    setTimeout(() => app.quit(), 2000);
  }
});

// Global error handlers
process.on("uncaughtException", err => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
