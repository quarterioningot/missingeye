const template = `
<audio src="{{audio-src}}" controls="false"></audio>
`;

class AudioPlayer extends HTMLElement {
    constructor() {
        super();

        // this.innerHTML = template;
    }
}

export function LoadAudioPlayer() {
    customElements.define("audio-player", AudioPlayer);
}