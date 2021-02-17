import {delay} from "./utils.js";

const template = ``;

class AudioManager {

    /**
     * List of tracks that can be played
     * @type {{
     *  [string]: any
     *  audio: Audio
     *  source: MediaElementAudioSourceNode
     *  duration: number
     *  isSeeking: boolean
     *  isPlaying: boolean
     *  onTimeUpdate: function(number)
     *  onStateChange: function()
     * }}
     * @private
     */
    _tracks = {}

    /**
     *
     * @type AnalyserNode
     * @private
     */
    _analyser

    /**
     *
     * @type AudioContext
     * @private
     */
    _audioContext

    constructor() {
        this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this._setupAnalyser();
    }

    async play(src) {
        if (!this._tracks[src]) {
            return;
        }

        for (const [, track] of Object.entries(this._tracks)) {
            if (!track || !(track.audio && track.isPlaying)) {
                continue;
            }

            track.audio.pause();
        }

        if (!this._tracks[src].audio) {
            await this._getAudio(src).then(duration => {
                this._tracks[src].duration = duration;
            });
        }

        this._tracks[src].audio.play();
        this._tracks[src].isPlaying = true;
    }

    pause(src) {
        if (!this._tracks[src]) {
            return;
        }

        this._tracks[src].audio.pause();
        this._tracks[src].isPlaying = false;
    }

    /**
     *
     * @param src string
     * @param onTimeUpdate function(number)
     * @param onStateChange function()
     */
    registerAudio(src, onTimeUpdate, onStateChange) {
        if (this._tracks[src]) {
            return;
        }

        this._tracks[src] = {
            duration: 0,
            isPlaying: false,
            isSeeking: false,
            onTimeUpdate,
            onStateChange
        }
    }

    seek(src, value) {
        if (!this._tracks[src]) {
            return;
        }

        this._tracks[src].audio.currentTime = value;
    }

    isPlaying(src) {
        if (!this._tracks[src]) {
            return false;
        }

        return this._tracks[src].isPlaying;
    }

    getDuration(src) {
        if (!this._tracks[src]) {
            return false;
        }

        return this._tracks[src].duration;
    }

    setIsSeeking(src, value) {
        if (!this._tracks[src]) {
            return false;
        }

        return this._tracks[src].isSeeking = value;
    }

    _getAudio(src) {
        return new Promise((resolve, reject) => {
            const context = this._tracks[src];
            if (!context) {
                reject();
                return;
            }

            const player = new Audio(src);
            context.source = this._audioContext.createMediaElementSource(player);
            context.source.connect(this._analyser);
            context.audio = player;
            player.volume = 0.9;
            player.addEventListener("durationchange", function() {
                if (this.duration !== Infinity || this.duration !== undefined) {
                    const duration = this.duration;
                    resolve(duration);
                }
            }, false);
            player.addEventListener("timeupdate", () => {
                if (context.isSeeking) {
                    return;
                }
                context.onTimeUpdate(player.currentTime);
            });
            player.addEventListener("play", () => {
                context.isPlaying = true;
                context.onStateChange()
            });
            player.addEventListener("pause", () => {
                context.isPlaying = false;
                context.onStateChange()
            });
            player.load();
        });
    }

    _setupAnalyser() {
        this._analyser = this._audioContext.createAnalyser();
        this._analyser.minDecibels = -90;
        this._analyser.maxDecibels = -10;
        this._analyser.smoothingTimeConstant = 0.85;

        this._analyser.fftSize = 2048;
        const bufferLength = this._analyser .frequencyBinCount;

        this._analyser.connect(this._audioContext.destination);

        const getFFT = () => requestAnimationFrame(async () => {
            const dataArray = new Uint8Array(bufferLength);
            this._analyser.getByteTimeDomainData(dataArray);

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

const AUDIO_MANAGER = new AudioManager();


const playTextNode = () => document.createTextNode("Play").cloneNode();
const pauseTextNode = () => document.createTextNode("!Play").cloneNode();

class AudioPlayer extends HTMLElement {
    _player;
    _progress;
    _playPauseButton;

    _source = undefined

    constructor() {
        super();

        this._progress = this.querySelector(`input[type="range"]`);
        this._playPauseButton = this.querySelector(`.playpause-button`);

        if (!this._progress || !this._playPauseButton) {
            return;
        }

        this._source = this.getAttribute("src");
        if (!this._source) {
            return;
        }

        AUDIO_MANAGER.registerAudio(this._source, (newTime) => {
            this._progress.value = newTime;
        }, () => {
            this._updatePlayPauseButton();
        });

        this._updatePlayPauseButton();

        this._playPauseButton.addEventListener("click", async e => {
            e.preventDefault()

            if (AUDIO_MANAGER.isPlaying(this._source)) {
                AUDIO_MANAGER.pause(this._source);
            } else {
                await AUDIO_MANAGER.play(this._source);
                this._progress.max = AUDIO_MANAGER.getDuration(this._source);
            }

            this._updatePlayPauseButton();
        });

        this._progress.addEventListener("change", () => {
            const value = this._progress.value;
            AUDIO_MANAGER.seek(this._source, value);
        })

        this._progress.addEventListener("mousedown", () => {
            const value = this._progress.value;
            AUDIO_MANAGER.setIsSeeking(this._source, true);
        });

        this._progress.addEventListener("mouseup", () => {
            const value = this._progress.value;
            AUDIO_MANAGER.setIsSeeking(this._source, false);
        });
    }

    _updatePlayPauseButton() {
        this._playPauseButton.innerHTML = ""
        if (AUDIO_MANAGER.isPlaying(this._source)) {
            this._playPauseButton.appendChild(pauseTextNode());
        } else {
            this._playPauseButton.appendChild(playTextNode());
        }
    }
}

export function LoadAudioPlayer() {
    customElements.define("audio-player", AudioPlayer);
}