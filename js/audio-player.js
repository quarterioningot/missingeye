const template = `
<audio src="{{audio-src}}" controls="false"></audio>
`;

const playTextNode = document.createTextNode("Play");
const pauseTextNode = document.createTextNode("!PLay");

class AudioPlayer extends HTMLElement {
    _player
    _progress
    _playPauseButton
    _audioContext

    _isPlaying = false

    constructor() {
        super();

        // this.innerHTML = template;

        this._progress = this.querySelector(`input[type="range"]`);
        this._playPauseButton = this.querySelector(`.playpause-button`);

        if (!this._progress || !this._playPauseButton) {
            return;
        }

        this._playPauseButton.innerHTML = ""
        this._playPauseButton.appendChild(playTextNode);

        this._playPauseButton.addEventListener("click", async e => {
            e.preventDefault()
            this._playPauseButton.innerHTML = ""
            if (this._isPlaying) {
                this._isPlaying = false;
                this._playPauseButton.appendChild(playTextNode);
                this._player.pause();
            } else {
                this._isPlaying = true;
                this._playPauseButton.appendChild(pauseTextNode);
                if (!this._player) {
                    this._progress.max = await this._getAudio("assets/music/gallery/back-to-darkness.mp3");

                    if (this._audioContext) {
                        this._audioContext.resume();
                    }
                }

                this._player.play();
            }
        });

        this._startFFT();
    }

    _getAudio(url) {
        return new Promise((resolve, reject) => {
            this._player = new Audio(url);
            this._player.volume = 0.9;
            this._player.addEventListener("durationchange", function (e) {
                if (this.duration !== Infinity) {
                    const duration = this.duration;
                    resolve(duration);
                }
            }, false);
            this._player.addEventListener("timeupdate", e => {
                this._progress.value = this._player.currentTime;
            })
            this._player.load();
        });
    }

    _startFFT() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;

        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;


        const getFFT = () => requestAnimationFrame(() => {
            const dataArray = new Uint8Array(bufferLength);s
            analyser.getByteTimeDomainData(dataArray);

            const total = dataArray.reduce((acc, curr) => acc + curr);
            const average = total / bufferLength;

            console.log("FFT AVG:", average);
            getFFT();
        })

        this._audioContext = audioCtx;

        getFFT();
    }
}

export function LoadAudioPlayer() {
    customElements.define("audio-player", AudioPlayer);
}