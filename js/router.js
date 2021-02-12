const CONTENT_STORE = {};

let MAIN_ROUTER = null;

class Router extends HTMLElement {

    _baseUrl = ""

    constructor() {
        super();

        if (MAIN_ROUTER) {
            return;
        }

        MAIN_ROUTER = this;

        const ice = this._interceptClickEvent();
        if (document.addEventListener) {
            document.addEventListener("click", ice);
        } else if (document.attachEvent) {
            document.attachEvent("onclick", ice);
        }

        window.addEventListener("popstate", async (event) => {
            const { pathname } = location;
            await this._loadPageContent(pathname, true);
        });

        this._baseUrl = document.querySelector("base").href;
    }

    /**
     * Loads page content and sets the history state
     * @param {string} pageId
     * @param {boolean?} restoreState
     */
    async _loadPageContent(pageId, restoreState) {
        if (!pageId) {
            pageId = "/"
        }

        let pageUri = pageId
        if (pageId.endsWith("/")) {
            pageUri = pageId + "index"
        }

        if (!CONTENT_STORE[pageId]) {
            const response = await fetch(pageUri + ".html");
            if (response.status !== 200) {
                alert("You're a naughty one, aren't you... ;)");
            }

            const responseData = await response.text();

            const mockElement = document.createElement("div");
            mockElement.innerHTML = responseData;

            CONTENT_STORE[pageId] = mockElement.querySelector("simple-router").innerHTML;
        }

        this.innerHTML = CONTENT_STORE[pageId];

        if (restoreState) {
            return;
        }

        const url = (this._baseUrl + pageId)
            .replace("://", "<proto>")
            .replace("//", "/")
            .replace("<proto>", "://");
        history.pushState({}, "", url);
    }

    _interceptClickEvent() {
        return async (e) => {
            const target = e.target || e.srcElement;
            if (target.tagName !== "A") {
                return;
            }

            e.preventDefault();
            const href = target.getAttribute("href");

            await this._loadPageContent(href);
        }
    }

}

export function LoadRouter() {
    customElements.define("simple-router", Router);
}