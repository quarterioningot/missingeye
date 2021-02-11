const { JSDOM } = require("jsdom");
const { promises: { readFile, readdir, writeFile } } = require("fs");

async function start() {

    const htmlFiles = await discoverHtmlFiles("./");

    const templateDom = await getDOM("index.html")
    if (!templateDom) {
        return;
    }

    const templateContentElement = templateDom.window.document.querySelector("simple-router");
    if (!templateContentElement) {
        return;
    }

    for (const target of htmlFiles) {
        const targetDom = await getDOM(target)
        if (!targetDom) {
            return;
        }

        const targetContentElement = targetDom.window.document.querySelector("simple-router");
        if (!targetContentElement) {
            return;
        }

        templateContentElement.innerHTML = targetContentElement.innerHTML

        const result = templateDom.serialize();
        await writeFile(target, result)
    }
}

async function discoverHtmlFiles(path) {
    const entries = await readdir(path, { withFileTypes: true });

    const files = entries
        .filter(file => !file.isDirectory())
        .map(file => path + file.name);

    const folders = entries.filter(folder => folder.isDirectory() && !folder.name.includes("node_modules") && !folder.name.includes(".git") && !folder.name.includes(".idea") && !folder.name.includes("tools"));

    for (const folder of folders) {
        files.push(...await discoverHtmlFiles(`${path}${folder.name}/`));
    }

    return files.filter(x => x.endsWith(".html"));
}

async function getDOM(templateName) {
    const template = await readFile(templateName);

    const templateDom = new JSDOM(template);
    if (!templateDom) {
        return;
    }

    return Promise.resolve(templateDom);
}

start();