const CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-={}[]:;'|?/>.<,><~`'"

function delay(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    })
}

class RandomText extends HTMLElement {

    constructor() {
        super();

        const charCount = parseInt(this.getAttribute("char-count")) || 1;
        this.innerText = Array(charCount).fill(".", 0, charCount).join("");

        this._start(charCount);
    }

    _start(charCount) {
        let isRandomizing = false;

        window.requestAnimationFrame(async () => {
            if (isRandomizing) {
                return;
            }

            isRandomizing = true;
            const explodedText = this.innerText.split("");
            for (let i = 0; i < charCount; i++) {
                const randomIndex = Math.round(Math.random() * (CHARSET.length - 1));
                explodedText[i] = CHARSET[randomIndex];
            }
            this.innerText = explodedText.join("");

            await delay(100);
            isRandomizing = false;

            this._start(charCount);
        })
    }
}

export function LoadRandomText() {
    customElements.define("random-text", RandomText);
}