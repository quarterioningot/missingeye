const { JSDOM } = require("jsdom");
const { ExifImage } = require("exif");
const sharp = require("sharp");
const path = require("path")
const { promises: { readFile, writeFile } } = require("fs");

const { findByType } = require("../utils/file-search.util")

async function start() {
    const target = "./photographs/index.html";
    const images = (await findByType("./assets/images/gallery", ".jpg"))
        .filter(x => !x.includes("_thumb"));

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

        const thumbPath = await resizeImage(image, "thumb", 500);
        img.src = thumbPath;
        img.alt = captionText;

        const linkName = path.basename(image, path.extname(image));
        anchor.href = `/photographs/${linkName}`
        caption.innerHTML = "";
        caption.appendChild(galleryDom.window.document.createTextNode(captionText));

        imageGallery.appendChild(clonedGalleryFigure);

        const title = exifData && exifData.image && exifData.image.XPTitle
            ? exifData.image.XPTitle.filter(x => x > 0).map(x => String.fromCharCode(x)).join("")
            : linkName.split("-").map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(" ")
        await createImageView(linkName, title, captionText, image);
    }

    const result = galleryDom.serialize();
    await writeFile(target, result)
}

async function resizeImage(imagePath, nameDecoration, size) {
    const image = await readFile(imagePath);

    const imageDir = path.dirname(imagePath);
    const imageExt = path.extname(imagePath);
    const imageName = path.basename(imagePath, imageExt);

    const newImagePath = path.join(imageDir, `${imageName}_thumb${imageExt}`)

    await sharp(image)
        .resize(size)
        .toFile(path.join(imageDir, `${imageName}_${nameDecoration}${imageExt}`))

    return newImagePath;
}

async function createImageView(linkName, title, description, src) {
    const imageViewDom = await getDOM(path.join("./", "photographs", "photograph.html"));
    if (!imageViewDom) {
        return;
    }

    const imageViewFigure = imageViewDom.window.document.querySelector(".image-gallery figure");
    if (!imageViewFigure) {
        return;
    }

    const header = imageViewDom.window.document.querySelector("h1");
    if (!header) {
        return;
    }

    const img = imageViewFigure.querySelector("img");
    const caption = imageViewFigure.querySelector("figcaption");

    header.innerHTML = "";
    header.appendChild(imageViewDom.window.document.createTextNode(title))

    img.src = src;

    caption.innerHTML = "";
    caption.appendChild(imageViewDom.window.document.createTextNode(description))

    const result = imageViewDom.serialize();
    const outputPath = path.join("photographs", `${linkName}.html`)
    return await writeFile(outputPath, result);
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