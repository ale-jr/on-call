const { app, BrowserWindow, Tray, nativeImage } = require('electron')
const { Bonjour } = require("bonjour-service")
const ical = require('node-ical');
const { PulseAudio } = require("pulseaudio.js")
const startNetwork = require("./network")



const pa = new PulseAudio()

let tray
const network = startNetwork(({ isRecording }) => {
    const icon = nativeImage.createFromPath(isRecording ? 'assets/speaking.png' : 'assets/quiet.png')
    tray.setImage(icon)
})
network.startServer()

const startMicNotifications = async (onChange) => {

    await pa.connect()

    pa.on("event.source_output.new", index => {
        verifyRecordingState().then(onChange)
    })

    pa.on("event.source_output.remove", index => {
        verifyRecordingState().then(onChange)
    })
}


const verifyRecordingState = () => {
    return pa.getSourceOutputList().then(sources => {
        return sources.some(source => source.name.includes("Record"))
    })
}



startMicNotifications((isRecording) => {
    console.log("isRecording", isRecording)
    network.broadcast({ isRecording })
})


const createWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            preload: require("path").join(__dirname, 'preload.js')
        }
    })

    window.loadFile("index.html")
}


app.whenReady().then(() => {

    const icon = nativeImage.createFromPath('assets/quiet.png')
    tray = new Tray(icon)
    tray.setToolTip("whatever")


    //createWindow()
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length < 1) {
        //createWindow()
    }
})