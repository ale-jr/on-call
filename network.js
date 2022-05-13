const http = require("http")
const { Bonjour } = require("bonjour-service")
const { fetch } = require("undici")

const bonjourInstance = new Bonjour()
const BONJOUR_PREFIX = "oncall-"
const createNetwork = (onReceive) => {
    const requestListener = (req, resp) => {

    }
    const server = http.createServer((req, resp) => {
        let message = ""
        req.on("data", (chunk) => {
            message += chunk.toString()
        })

        req.on("end", () => {
            console.log("data", message)
            resp.writeHead(200)
            resp.end()
        })

    })
    const port = Math.round(Math.random() * 10000) + 10000
    let serviceName = `${BONJOUR_PREFIX}${require("os").hostname()}${port}`
    const browser = bonjourInstance.find({ type: 'http' })
    const startServer = () => {
        server.listen(port, (error) => {
            console.log("started on port", port)
        })

        bonjourInstance.publish({
            name: serviceName, type: "http", port, txt: {
                userInfo: JSON.stringify({
                    name: "",
                    calendar: ""
                })
            }
        })
        browser.start()
    }



    const broadcast = (message) => {
        const servers = getOtherServers()

        servers.forEach(server => {
            sendMessage(message, server)
        })

    }


    const sendMessage = (message, server) => {
        const { addresses, name, port } = server

        console.log("sending message to", name)
        return fetch(`http://${addresses[0]}:${port}/message`, {
            body: JSON.stringify(message),
            method: 'POST',
        })
            .then(response => response.ok)
            .catch((error) => console.log(error))

    }

    const getOtherServers = () => {
        const allServices = browser.services
        return allServices.filter(service => typeof service?.name === "string" && service.name.startsWith(BONJOUR_PREFIX) && service.name !== serviceName).map(service => {
            return {
                addresses: service.addresses,
                port: service.port,
                name: service.name
            }
        })
    }

    return { startServer, broadcast }
}


module.exports = createNetwork