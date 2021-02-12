const CONTENT_STORE = {};

let MAIN_ROUTER = null;

class Router extends HTMLElement {

    _baseUrl = ""
    _basePath = ""

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
        const url = new URL("/", this._baseUrl);
        this._basePath = url.pathname;
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

        const contentID = this._basePath + pageId;
``
        if (!CONTENT_STORE[pageId]) {
            const url = cleanUrl(this._baseUrl + pageUri + ".html");
            const response = await fetch(url);
            if (response.status !== 200) {
                alert("You're a naughty one, aren't you... ;)");
            }

            const responseData = await response.text();

            const mockElement = document.createElement("div");
            mockElement.innerHTML = responseData;

            CONTENT_STORE[contentID] = mockElement.querySelector("simple-router").innerHTML;
        }

        this.innerHTML = CONTENT_STORE[contentID];

        if (restoreState) {
            return;
        }

        const url = cleanUrl(this._baseUrl + pageId);
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

function cleanUrl(url) {
    return url.replace("://", "<proto>")
        .replace("//", "/")
        .replace("<proto>", "://");
}

export function LoadRouter() {
    customElements.define("simple-router", Router);
}