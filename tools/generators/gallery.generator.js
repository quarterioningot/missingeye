const { JSDOM } = require("jsdom");
const { ExifImage } = require("exif");
const { promises: { readFile, readdir, writeFile } } = require("fs");

const { findByType } = require("../utils/file-search.util")

async function start() {
    const target = "./photographs/index.html";
    const images = await findByType("./assets/images/gallery", ".jpg");

    const galleryDom = await getDOM(target);
    if (!galleryDom) {
       return;
    }

    const galleryFigure = galleryDom.window.document.querySelector(".image-gallery figure");
    if (!galleryFigure) {
        return;
    }

    const imageGallery = galleryDom.window.document.querySelector(".image-gallery");
    imageGallery.innerHTML = "";

    for (const image of images) {
        const exifData = await new Promise((resolve, reject) => {
            try {
                new ExifImage({
                    image
                }, (error, data) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(data);
                });
            } catch (error) {
                reject(error)
            }
        })

        const clonedGalleryFigure = galleryFigure.cloneNode(true);

        const img = clonedGalleryFigure.querySelector("img");
        const anchor = clonedGalleryFigure.querySelector("a");
        const caption = clonedGalleryFigure.querySelector("figcaption");

        const captionText = exifData && exifData.image && exifData.image.XPComment
            ? exifData.image.XPComment.filter(x => x > 0).map(x => String.fromCharCode(x)).join("")
            : "No caption available.";

        img.src = `/${image}`;
        img.alt = captionText;
        anchor.href = `/photographs/${image}`
        caption.innerHTML = "";
        caption.appendChild(galleryDom.window.document.createTextNode(captionText))

        imageGallery.appendChild(clonedGalleryFigure)
    }

    const result = galleryDom.serialize();
    await writeFile(target, result)
}

async function getDOM(templateName) {
    const template = await readFile(templateName);

    const templateDom = new JSDOM(template);
    if (!templateDom) {
        return;
    }

    return Promise.resolve(templateDom);
}

start()
    .then();