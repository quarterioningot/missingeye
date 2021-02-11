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

const ROUTE_MAP_CONTACT = {
    id: "contact",
    location: "contact.html",
    pathname: "/contact"
};

const ROUTE_MAP_PHOTOGRAPHS = {
    id: "photographs",
    location: "photographs/index.html",
    pathname: "/photographs"
};

const ROUTE_MAP_PHOTOGRAPH = {
    id: "photograph",
    location: "photographs/photograph.html",
    pathname: "/photographs/photograph"
};

const ROUTE_MAP = {
    "": ROUTE_MAP_INDEX,
    "/": ROUTE_MAP_INDEX,
    "/index.html": ROUTE_MAP_INDEX,
    "/about": ROUTE_MAP_ABOUT,
    "/about.html": ROUTE_MAP_ABOUT,
    "/contact": ROUTE_MAP_CONTACT,
    "/contact.html": ROUTE_MAP_CONTACT,
    "/photographs": ROUTE_MAP_PHOTOGRAPHS,
    "/photographs/index.html": ROUTE_MAP_PHOTOGRAPHS,
    "/photographs/photograph": ROUTE_MAP_PHOTOGRAPH,
    "/photographs/photograph.html": ROUTE_MAP_PHOTOGRAPH,
};

const CONTENT_STORE = {
    "index": undefined,
    "about": undefined
};

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

        const url = (this._baseUrl + route.pathname)
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