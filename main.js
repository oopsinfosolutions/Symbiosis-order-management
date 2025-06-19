console.log("Electron main process started");

const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

let backendProcess;

function createWindow() {
  console.log("Creating window...");
  
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const isDev = !app.isPackaged;
  console.log("Is development mode:", isDev);
  console.log("__dirname:", __dirname);
  console.log("process.resourcesPath:", process.resourcesPath);

  if (isDev) {
    // Development mode
    win.webContents.openDevTools();

    win.loadURL("http://localhost:3000").catch(err => {
      console.error("Failed to load React dev server:", err);
      win.loadURL(`data:text/html,<h1>Please start React dev server first: npm start</h1>`);
    });
    win.webContents.openDevTools();
  } else {
    // Production mode - try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, "build", "index.html"),
      path.join(__dirname, "frontend", "build", "index.html"),
      path.join(process.resourcesPath, "build", "index.html"),
      path.join(process.resourcesPath, "frontend", "build", "index.html"),
      path.join(process.resourcesPath, "app", "build", "index.html"),
      path.join(process.resourcesPath, "app", "frontend", "build", "index.html"),
      path.join(__dirname, "..", "build", "index.html"),
      path.join(__dirname, "..", "frontend", "build", "index.html")
    ];

    let buildPath = null;
    console.log("Searching for React build files...");
    
    for (const possiblePath of possiblePaths) {
      console.log("Checking path:", possiblePath);
      console.log("Exists:", fs.existsSync(possiblePath));
      if (fs.existsSync(possiblePath)) {
        buildPath = possiblePath;
        console.log("✓ Found build at:", buildPath);
        break;
      }
    }

    if (buildPath) {
      console.log("Loading React app from:", buildPath);
      win.loadFile(buildPath).then(() => {
        console.log("React app loaded successfully");
      }).catch(err => {
        console.error("Failed to load built React app:", err);
        win.loadURL(`data:text/html,<h1>Error loading app</h1><p>Error: ${err.message}</p><p>Path: ${buildPath}</p>`);
      });
    } else {
      console.error("Could not find React build files in any expected location");
      
      // Show detailed error with all checked paths
      const pathList = possiblePaths.map(p => {
        const exists = fs.existsSync(p);
        return `<li style="color: ${exists ? 'green' : 'red'}">${p} ${exists ? '✓' : '✗'}</li>`;
      }).join('');
      
      const errorHtml = `
        <html>
          <head><title>Build Not Found</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: red;">React build files not found</h1>
            <p><strong>Make sure you have built your React app before packaging!</strong></p>
            <p>Run this in your React app directory:</p>
            <code style="background: #f0f0f0; padding: 5px;">npm run build</code>
            <h3>Searched in these locations:</h3>
            <ul>${pathList}</ul>
            <hr>
            <p><strong>Current directory:</strong> ${__dirname}</p>
            <p><strong>Resources path:</strong> ${process.resourcesPath}</p>
            <p><strong>App packaged:</strong> ${app.isPackaged}</p>
          </body>
        </html>
      `;
      
      win.loadURL(`data:text/html,${encodeURIComponent(errorHtml)}`);
    }
  }

  win.on("ready-to-show", () => {
    console.log("Window ready to show");
    win.show();
  });

  // Add error handling for web contents
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL, 'Error:', errorDescription, 'Code:', errorCode);
  });

  win.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  return win;
}

function startBackend() {
  const isDev = !app.isPackaged;
  
  if (!isDev) {
    console.log("Production mode - backend disabled to avoid spawn issues");
    console.log("If you need backend in production, consider using Electron's IPC or embedding the server code directly");
    return;
  }
  
  // Only run backend in development mode
  try {
    const backendPath = path.join(__dirname, "backend");
    const serverPath = path.join(backendPath, "server.js");

    console.log("Development mode - starting backend");
    console.log("Backend path:", backendPath);
    console.log("Server path:", serverPath);

    if (!fs.existsSync(serverPath)) {
      console.error("server.js not found at:", serverPath);
      return;
    }

    backendProcess = spawn("node", ["server.js"], {
      cwd: backendPath,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    backendProcess.stdout.on("data", (data) => {
      console.log(`Backend: ${data.toString().trim()}`);
    });

    backendProcess.stderr.on("data", (data) => {
      console.error(`Backend Error: ${data.toString().trim()}`);
    });

    backendProcess.on("close", (code) => {
      console.log(`Backend exited with code ${code}`);
    });

    backendProcess.on("error", (err) => {
      console.error("Failed to start backend process:", err);
    });

  } catch (error) {
    console.error("Error in startBackend:", error);
  }
}

function stopBackend() {
  if (backendProcess) {
    console.log("Stopping backend...");
    try {
      backendProcess.kill('SIGTERM');
      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          backendProcess.kill('SIGKILL');
        }
      }, 5000);
    } catch (error) {
      console.error("Error stopping backend:", error);
    }
    backendProcess = null;
  } else {
    console.log("Backend running in main process - no separate process to stop");
  }
}

// Enhanced error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  console.error("Stack:", err.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// App events
app.whenReady().then(() => {
  console.log("App is ready, packaged:", app.isPackaged);
  console.log("__dirname:", __dirname);
  console.log("process.resourcesPath:", process.resourcesPath);
  
  // Temporarily disable backend to focus on frontend issue
  // setTimeout(() => {
  //   startBackend();
  // }, 1000);
  
  console.log("Creating window without backend for now...");
  createWindow();
});

app.on("window-all-closed", () => {
  stopBackend();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  stopBackend();
});

app.on("will-quit", (event) => {
  if (backendProcess) {
    event.preventDefault();
    stopBackend();
    setTimeout(() => {
      app.quit();
    },2000);
}
});