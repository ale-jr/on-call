
window.electronAPI.handleNotification((event, isRecording) => {
    console.log("event")
    if (isRecording) {
        sendNotification("Mic sendo usado")
    }
    else {
        sendNotification("Mic parou de ser usado")
    }
})

const sendNotification = (title) => {
    new Notification(title, {
        body: "body"
    }).onclick = () => {
        console.log("clicked")
    }
}
