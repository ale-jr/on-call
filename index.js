const { app, BrowserWindow, net } = require('electron')
const { Bonjour } = require("bonjour-service")
const ical = require('node-ical');
const { PulseAudio } = require("pulseaudio.js")
const startNetwork = require("./network")

const pa = new PulseAudio()


const network = startNetwork(() => console.log("hello"))
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