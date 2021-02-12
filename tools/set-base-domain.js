const { JSDOM } = require("jsdom");
const { promises: { readFile, readdir, writeFile } } = require("fs");

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

async function start(href) {
    const htmlFiles = await discoverHtmlFiles("./");

    for (const htmlFile of htmlFiles) {
        const template = await readFile(htmlFile);

        const templateDom = new JSDOM(template);
        if (!templateDom) {
            continue;
        }

        const base = templateDom.window.document.querySelector("base");
        if (!base) {
            continue;
        }

        base.href = href;

        const result = templateDom.serialize();
        await writeFile(htmlFile, result);
    }
}

const baseUrl = process.argv[2]
if (!baseUrl) {
    process.exit(1)
    return;
}

start(baseUrl)
    .then();

