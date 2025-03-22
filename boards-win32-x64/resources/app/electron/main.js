import { app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Definir rutas base
const APP_ROOT = path.join(__dirname, "..");
const MAIN_DIST = path.join(APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(APP_ROOT, "dist");

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, "public") : RENDERER_DIST;

let mainWindow = null;

/**
 * Crea la ventana principal de la aplicación.
 */
function createWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 1240,
      height: 670,
      icon: path.join(VITE_PUBLIC, "electron-vite.svg"),
      webPreferences: {
        preload: path.join(__dirname, "preload.mjs"),
      },
    });

    // Enviar mensaje al Renderer cuando la ventana se carga completamente
    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow?.webContents.send("main-process-message", new Date().toLocaleString());
    });

    // Cargar la URL de desarrollo o el archivo de producción
    if (VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
    }
  } catch (error) {
    console.error("Error al crear la ventana:", error);
  }
}

/**
 * Configura los eventos del ciclo de vida de la aplicación.
 */
function setupAppListeners() {
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && app.isReady()) {
      createWindow();
    }
  });
}

// Iniciar la aplicación
app.whenReady().then(() => {
  createWindow();
  setupAppListeners();
});