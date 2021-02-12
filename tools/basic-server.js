// based on https://medium.com/@amitgupta15/minimal-http-server-in-node-js-without-framework-aede70695fc0

const http = require("http");
const fs = require("fs");
const path = require("path");
const server = {};

const host = "localhost";
const port = 8080;

const baseDir = path.join(process.cwd());
const httpServer = http.createServer(async (request, response) => {

    const parsedUrl = new URL(request.url, `http://${host}:${port}`);
    let pathName = parsedUrl.pathname;
    if (pathName.endsWith("/")) {
        pathName = pathName + "index.html"
    }

    if (!pathName.includes(".")) {
        pathName += ".html";
    }

    const responseContentType = getContentType(pathName);
    response.setHeader("Content-Type", responseContentType);

    try {
        const data = await fs.promises.readFile(path.join(baseDir, pathName));
        let resultData = data;
        if (responseContentType === "text/html") {
            let stringData = data.toString();
            resultData = stringData.replace(`<base href="https://quarterioningot.github.io/missingeye" target="_blank">`, `<base href="http://${host}:${port}" target="_blank">`)
        }
        response.writeHead(200);
        response.end(resultData);
    } catch (error) {
        console.log(error);
        response.writeHead(404);
        response.end("404 - File Not Found");
    }
});

const mimeTypes = {
    ".html": "text/html",
    ".jgp": "image/jpeg",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".ico": "image/x-icon",
};

const getContentType = pathName => {
    let contentType = "application/octet-stream";

    for (const key in mimeTypes) {
        if (!mimeTypes.hasOwnProperty(key) || !pathName.includes(key)) {
            continue;
        }

        contentType = mimeTypes[key];
    }

    return contentType;
};

httpServer.listen(port);

module.exports = server;