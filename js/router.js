const ROUTE_MAP_INDEX = {
    id: "index",
    location: "index.html",
    pathname: "/"
};

const ROUTE_MAP_ABOUT = {
    id: "about",
    location: "about.html",
    pathname: "/about"
};

const ROUTE_MAP = {
    "": ROUTE_MAP_INDEX,
    "/": ROUTE_MAP_INDEX,
    "/index.html": ROUTE_MAP_INDEX,
    "/about": ROUTE_MAP_ABOUT,
    "/about.html": ROUTE_MAP_ABOUT
};

const CONTENT_STORE = {
    "index": undefined,
    "about": undefined
};

let MAIN_ROUTER = null;

class Router extends HTMLElement {

    #baseUrl = ""

    constructor() {
        super();

        if (MAIN_ROUTER) {
            return;
        }

        MAIN_ROUTER = this;

        const ice = this.interceptClickEvent();
        if (document.addEventListener) {
            document.addEventListener("click", ice);
        } else if (document.attachEvent) {
            document.attachEvent("onclick", ice);
        }

        window.addEventListener("popstate", async (event) => {
            const { pathname } = location;
            await this.loadPageContent(pathname, true);
        });

        this.#baseUrl = document.querySelector("base").href;
    }

    /**
     * Loads page content and sets the history state
     * @param {string} pageId
     * @param {boolean?} restoreState
     */
    async loadPageContent(pageId, restoreState) {
        const route = ROUTE_MAP[pageId];
        if (!route) {
            alert("You're a naughty one, aren't you... ;)");
        }

        if (!restoreState && route.pathname === location.pathname) {
            return;
        }

        if (!CONTENT_STORE[route.id]) {
            const response = await fetch(route.location);
            if (response.status !== 200) {
                alert("You're a naughty one, aren't you... ;)");
            }

            const responseData = await response.text();

            const mockElement = document.createElement("div");
            mockElement.innerHTML = responseData;

            CONTENT_STORE[route.id] = mockElement.querySelector("simple-router").innerHTML;
        }

        this.innerHTML = CONTENT_STORE[route.id];

        if (restoreState) {
            return;
        }

        const url = (this.#baseUrl + route.pathname)
            .replace("://", "<proto>")
            .replace("//", "/")
            .replace("<proto>", "://");
        history.pushState({}, "", url);
    }

    interceptClickEvent() {
        return async (e) => {
            const target = e.target || e.srcElement;
            if (target.tagName !== "A") {
                return;
            }

            e.preventDefault();
            const href = target.getAttribute("href");

            await this.loadPageContent(href);
        }
    }

}

export function LoadRouter() {
    customElements.define("simple-router", Router);
}