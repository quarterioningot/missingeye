import { LoadRouter } from "./router.js"
import { LoadMenu } from "./menu.js"
import { LoadRandomText } from "./random-text.js"
import { LoadContent } from "./content.js"

LoadRouter()
LoadMenu()
LoadRandomText();
LoadContent();

const CONFIG = {
    apiReadiness: "http://localhost:3000/health/ready",
    apiLiveness: "http://localhost:3000/health/live",
    apiBase: "http://localhost:3000/api/v1",
}

let ApiReady = false
let CheckingServerHealth = false
const ReadyIntervalRef = setInterval(async () => {
    if (CheckingServerHealth) {
        return
    }

    CheckingServerHealth = true

    try {
        const responseLive = await fetch(`${CONFIG.apiLiveness}`)
        if (responseLive.status !== 200) {
            CheckingServerHealth = false
            return
        }

        const responseReady = await fetch(`${CONFIG.apiReadiness}`)
        if (responseReady.status !== 200) {
            CheckingServerHealth = false
            return
        }

        clearInterval(ReadyIntervalRef)
        ApiReady = true
    } catch {}

    CheckingServerHealth = false

    const apiReadyEvent = new Event("ME:ApiReady")
    document.dispatchEvent(apiReadyEvent)
}, 250)


document.addEventListener("ME:ApiReady", async () => {
    // not yet implemented
})