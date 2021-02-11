const CONFIG = {
    apiReadiness: "http://localhost:3000/health/ready",
    apiLiveness: "http://localhost:3000/health/live",
    apiBase: "http://localhost:3000/api/v1",
}

class AsyncContent extends HTMLElement {

    constructor() {
        super();

        const path = this.getAttribute("path");
        if (!path) {
            throw new Error("Path attribute is invalid");
        }

        this._load(path).then();
    }

    /**
     * Fetches an article from the api
     * @param path
     * @returns {Promise<string|null>}
     */
    async _load(path) {
        const responseContent = await fetch(`${CONFIG.apiBase}/file/${path}.md`)
        if (responseContent.status !== 200) {
            return null
        }

        const text = await responseContent.text()
        this.innerHTML = marked(text)
    }
}

export function LoadContent() {
    customElements.define("async-content", AsyncContent);
}