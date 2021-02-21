import * as THREE from "https://unpkg.com/three/build/three.module.js";
import { TexturedParticleContainer, Particle } from "./bubbles/particles/particles.js"
import { translateVector, process, TRANSLATE_VECTOR_CONTEXT_STATE_STOPPED } from "./bubbles/animations/translate.js"

class BackgroundParticles {

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
     * @type TexturedParticleContainer
     * @private
     */
    _particleContainer;

    /**
     * @type number
     * @private
     */
    _acceleration = 0;

    /**
     *
     * @param scene THREE.Scene
     * @param camera THREE.PerspectiveCamera
     * @param textureLoader THREE.TextureLoader
     * @param particleCount number
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
     * @param delta number
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

export function LoadCanvasWrangler() {
    const scene = new THREE.Scene();
    const left = 0;
    const right = 1;
    const top = 1;
    const bottom = 0;
    const near = -1;
    const far = 1;
    const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera.zoom = 1;

    const renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearAlpha(0);
    const canvas = renderer.domElement;
    document.body.prepend(canvas);

    const textureLoader = new THREE.TextureLoader();

    /* cube - start */
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshFaceMaterial([
        new THREE.MeshBasicMaterial({color: 0x00ff00}),
        new THREE.MeshBasicMaterial({color: 0x00ff00}),
        new THREE.MeshBasicMaterial({color: 0x00ff00}),
        new THREE.MeshBasicMaterial({color: 0x00ff00}),
        new THREE.MeshBasicMaterial({color: 0x00ff00}),
        new THREE.MeshBasicMaterial({color: 0x00ff00})
    ]);
    const cube = new THREE.Mesh(geometry, cubeMaterial);
    cube.scale.x = 0.2;
    cube.scale.y = 0.2;
    cube.scale.z = 0.2;
    cube.position.set(0.5, 0.5, 0);
    // scene.add(cube);

    const cubeVector = new THREE.Vector3(0.5, 0.5, 0);
    translateVector({
        fromVector: new THREE.Vector3(cube.position.x, cube.position.y, cube.position.z),
        toVector: new THREE.Vector3(0, cube.position.y, cube.position.z),
        duration: 2000,
        outVector: cubeVector
    });

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    let pushValue = 0.01;

    document.addEventListener("audio-player", e => {
        pushValue = e.detail < 3 ? 0.01 : e.detail / 100;
    });
    /* cube - end */


    /* particles - start */
    const backgroundParticles = new BackgroundParticles(scene, camera, textureLoader, 300);
    /* particles - end */

    let delta = 0;
    async function animate() {
        const timeStart = Date.now();
        requestAnimationFrame(animate);

        process(timeStart, delta);

        backgroundParticles.process(delta);
        renderer.render(scene, camera);

        cube.position.set(cubeVector.x, cubeVector.y, cubeVector.z);

        delta = Date.now() - timeStart;
    }

    animate();
}

function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Referenced from https://stackoverflow.com/questions/23155443/moving-individual-particles-within-a-three-js-particle-system
 * @param dx number
 * @param dy number
 * @param camera THREE.PerspectiveCamera
 * @returns {THREE.Vector3}
 */
function getSceneToWorld(dx, dy, camera) {
    const mouse3D = new THREE.Vector3(dx / window.innerWidth * 2 - 1, -dy / window.innerHeight * 2 + 1, 0.5)
        .unproject(camera);
    mouse3D.sub(camera.position);
    mouse3D.normalize();
    const rayCaster = new THREE.Raycaster(camera.position, mouse3D);
    var scale = window.innerWidth * 2;
    const rayDir = new THREE.Vector3(rayCaster.ray.direction.x * scale, rayCaster.ray.direction.y * scale, rayCaster.ray.direction.z * scale);
    return new THREE.Vector3(camera.position.x + rayDir.x, camera.position.y + rayDir.y, camera.position.z + rayDir.z);
}