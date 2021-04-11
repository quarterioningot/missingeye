import * as THREE from "three";
import {TexturedParticleContainer} from "../particles.js";
import {TRANSLATE_VECTOR_CONTEXT_STATE_STOPPED, translateVector} from "../../animations/translate.js";

export class FloatingBokeh {

    /**
     *
     * @type {{
     *     particle: Particle,
     *     startDelay: number,
     *     translatePosition: TranslateVectorContext
     *     translateOpacity: TranslateVectorContext
     *     isStarted: boolean
     * }[]}
     * @private
     */
    _particleConfigs = [];

    /**
     *
     * @type {TexturedParticleContainer}
     * @private
     */
    _particleContainer;

    /**
     * @type {number}
     * @private
     */
    _acceleration = 0;

    /**
     *
     * @param {THREE.Scene} scene
     * @param {THREE.PerspectiveCamera} camera
     * @param {THREE.TextureLoader} textureLoader
     * @param {number} particleCount
     */
    constructor(scene, camera, textureLoader, particleCount) {
        this._scene = scene;
        this._camera = camera;
        this._textureLoader = textureLoader;
        this._particleCount = particleCount;

        this._setup();

        document.addEventListener("audio-player", e => {
            this._acceleration = e.detail < 3 ? 0 : (e.detail / 100) + Math.floor(e.detail / 3);
        });
    }

    _setup() {
        const particleSprites = [
            this._textureLoader.load("assets/textures/sprites/orb2.png"),
            this._textureLoader.load("assets/textures/sprites/orb3.png"),
            this._textureLoader.load("assets/textures/sprites/orb4.png")
        ];
        let particleMaterialGroups = [];
        for (let i  = 0; i < this._particleCount; i++) {
            particleMaterialGroups[i] = {
                size: 100,
                texture: particleSprites[Math.floor(Math.random() * particleSprites.length)],
                color: {
                    h: Math.random(),
                    s: 0.5,
                    l: 0.5
                },
                range: {
                    start: i,
                    stride: 1
                }
            }
        }

        this._particleContainer = new TexturedParticleContainer(
            this._scene,
            this._camera,
            this._particleCount,
            particleMaterialGroups
        );

        const particles = this._particleContainer.getParticles();
        let lastDelay = 0;
        for (let i  = 0; i < particles.length; i++) {
            const particle = particles[i];
            particle.setOrigin(Math.random(), 0);

            const translatePosition = translateVector({
                fromVector: new THREE.Vector3(Math.random(), 0, 0),
                toVector: new THREE.Vector3(Math.random(), 1.2, 0),
                duration: Math.floor(Math.random() * 9000) + 5000
            });
            translatePosition.stop();

            const translateOpacity = translateVector({
                fromVector: new THREE.Vector3(0, 0, 0),
                toVector: new THREE.Vector3(1, 0, 0),
                duration: Math.floor(Math.random() * 250) + 250
            });
            translateOpacity.stop();

            this._particleConfigs.push({
                particle,
                startDelay: lastDelay + Math.floor(Math.random() * 25),
                translatePosition: translatePosition,
                translateOpacity: translateOpacity,
                isStarted: false

            });
            lastDelay += Math.floor(Math.random() * 50);
        }
    }

    /**
     *
     * @param {number} delta
     */
    process(delta) {
        for (const particleConfig of this._particleConfigs) {
            if (particleConfig.startDelay > 0) {
                particleConfig.startDelay -= delta;
                continue;
            }

            if (!particleConfig.isStarted) {
                particleConfig.translatePosition.start();
                particleConfig.translateOpacity.start();
                particleConfig.isStarted = true;
            }

            if (particleConfig.translatePosition.getState() === TRANSLATE_VECTOR_CONTEXT_STATE_STOPPED) {
                particleConfig.translatePosition.reset();
                particleConfig.translateOpacity.reset();
                particleConfig.translatePosition.start();
                particleConfig.translateOpacity.start();
            }

            particleConfig.translatePosition.setBoost(this._acceleration);

            const position = particleConfig.translatePosition.getResult()
            const opacity = particleConfig.translateOpacity.getResult()

            particleConfig.particle.setPosition(position);
            particleConfig.particle.setOpacity(opacity.x);
        }

        if (this._acceleration > 0) {
            this._acceleration -= 1;
            if (this._acceleration < 0) {
                this._acceleration = 0;
            }
        }

        this._particleContainer.render(delta);
    }

}