import {delay} from "./utils.js";

const template = `
<audio src="{{audio-src}}" controls="false"></audio>
`;

const playTextNode = document.createTextNode("Play");
const pauseTextNode = document.createTextNode("!PLay");

class AudioPlayer extends HTMLElement {
    _player;
    _progress;
    _playPauseButton;
    _audioContext;

    _isReady = false;
    _isPlaying = false;
    _isSeeking = false;

    constructor() {
        super();

        // this.innerHTML = template;

        this._progress = this.querySelector(`input[type="range"]`);
        this._playPauseButton = this.querySelector(`.playpause-button`);

        if (!this._progress || !this._playPauseButton) {
            return;
        }



        this._getAudio("assets/music/gallery/back-to-darkness.mp3").then(duration => {
            this._progress.max = duration;
            this._updatePlayPauseButton();
            this._isReady = true;
        });

        this._playPauseButton.addEventListener("click", async e => {
            e.preventDefault()

            if (!this._isReady) {
                return;
            }

            if (this._isPlaying) {
                this._player.pause();
            } else {
                if (!this._player) {
                    if (this._audioContext) {
                        this._audioContext.resume();
                    }
                }

                this._player.play();
            }
        });

        this._progress.addEventListener("change", () => {
            const value = this._progress.value;
            this._player.currentTime = value;
        })

        this._progress.addEventListener("mousedown", () => {
            this._isSeeking = true;
        });
        this._progress.addEventListener("mouseup", () => {
            this._isSeeking = false;
        });
    }

    _getAudio(url) {
        return new Promise((resolve, reject) => {
            this._player = new Audio(url);
            this._player.volume = 0.9;
            this._player.addEventListener("durationchange", function() {
                if (this.duration !== Infinity || this.duration !== undefined) {
                    const duration = this.duration;
                    resolve(duration);
                }
            }, false);
            this._player.addEventListener("timeupdate", () => {
                if (this._isSeeking) {
                    return;
                }
                this._progress.value = this._player.currentTime;
            });
            this._player.addEventListener("play", () => {
                this._isPlaying = true;
                this._updatePlayPauseButton();
                this._startFFT();
            });
            this._player.addEventListener("pause", () => {
                this._isPlaying = false;
                this._updatePlayPauseButton();
            });
            this._player.load();
        });
    }

    _updatePlayPauseButton() {
        this._playPauseButton.innerHTML = ""
        if (this._isPlaying) {
            this._playPauseButton.appendChild(pauseTextNode);
        } else {
            this._playPauseButton.appendChild(playTextNode);
        }
    }

    _startFFT() {
        if (this._audioContext) {
            return;
        }

        this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = this._audioContext.createMediaElementSource(this._player)

        const analyser = this._audioContext.createAnalyser();
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;

        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;

        source.connect(analyser);
        analyser.connect(this._audioContext.destination);


        const getFFT = () => requestAnimationFrame(async () => {
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);

            const total = dataArray.reduce((acc, curr) => acc + curr);
            const average = total / bufferLength;

            const result = average - 128;
            const event = new CustomEvent("audio-player", {
                detail: result
            });
            document.dispatchEvent(event);

            await delay(10)
            getFFT();
        });

        getFFT();
    }
}

export function LoadAudioPlayer() {
    customElements.define("audio-player", AudioPlayer);
}