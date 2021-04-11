import * as THREE from "three";
import {TexturedParticleContainer} from "../particles.js";
import {TRANSLATE_VECTOR_CONTEXT_STATE_STOPPED, translateVector} from "../../animations/translate.js";

export class ShootingBokeh {

    /**
     *
     * @type {{
     *     particle: Particle,
     *     translatePosition: TranslateVectorContext
     *     translateOpacity: TranslateVectorContext
     * }[]}
     * @private
     */
    _heldParticleConfigs = [];
    _releasedParticleConfigs = [];

    /**
     *
     * @type {TexturedParticleContainer}
     * @private
     */
    _particleContainer;

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
    }

    _setup() {
        const particleSprites = [
            this._textureLoader.load("assets/textures/sprites/orb2.png"),
            this._textureLoader.load("assets/textures/sprites/orb3.png"),
            this._textureLoader.load("assets/textures/sprites/orb4.png")
        ];
        let particleMaterialGroups = [];
        for (let i = 0; i < this._particleCount; i++) {
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
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            particle.setOrigin(Math.random(), 0);

            const translatePosition = translateVector({
                fromVector: new THREE.Vector3(Math.random(), 0, 0),
                toVector: new THREE.Vector3(Math.random(), 1.2, 0),
                duration: Math.floor(Math.random() * 500) + 500
            });
            translatePosition.stop();

            const translateOpacity = translateVector({
                fromVector: new THREE.Vector3(0, 0, 0),
                toVector: new THREE.Vector3(1, 0, 0),
                duration: Math.floor(Math.random() * 150) + 150
            });
            translateOpacity.stop();

            this._heldParticleConfigs.push({
                particle,
                translatePosition: translatePosition,
                translateOpacity: translateOpacity

            });
        }
    }

    /**
     *
     * @param {number} count
     */
    releaseBokeh(count) {
        for (let i = 0; i < this._heldParticleConfigs.length; i++) {
            const particleConfig = this._heldParticleConfigs[i];
            particleConfig.translatePosition.reset();
            particleConfig.translateOpacity.reset();
            particleConfig.translatePosition.start();
            particleConfig.translateOpacity.start();

            this._releasedParticleConfigs.push(particleConfig);
            this._heldParticleConfigs[i] = undefined;

            count--;
            if (count <= 0) {
                break;
            }
        }

        this._heldParticleConfigs = this._heldParticleConfigs.filter(x => !!x);
    }

    /**
     *
     * @param {number} delta
     */
    process(delta) {
        for (let i = 0; i < this._releasedParticleConfigs.length; i++) {
            const particleConfig = this._releasedParticleConfigs[i];
            if (particleConfig.translatePosition.getState() === TRANSLATE_VECTOR_CONTEXT_STATE_STOPPED) {
                this._heldParticleConfigs.push(particleConfig);
                this._releasedParticleConfigs[i] = undefined;
                continue;
            }

            const position = particleConfig.translatePosition.getResult()
            const opacity = particleConfig.translateOpacity.getResult()

            particleConfig.particle.setPosition(position);
            particleConfig.particle.setOpacity(opacity.x);
        }

        this._releasedParticleConfigs = this._releasedParticleConfigs.filter(x => !!x);

        this._particleContainer.render(delta);
    }

}