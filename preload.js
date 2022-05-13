const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld('electronAPI', {
    handleNotification: (callback) => ipcRenderer.on("notification", callback)
})