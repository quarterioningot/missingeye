import * as THREE from "https://unpkg.com/three/build/three.module.js";
import { TexturedParticleContainer, Particle } from "./bubbles/particles/particles.js"

class BackgroundParticles {

    /**
     *
     * @type {{
     *     particle: Particle,
     *     startDelay: number,
     *     speedY: number,
     *     speedX: number,
     *     speedOpacity: number,
     *     positionLimitY: number
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
            this._particleConfigs.push({
                particle,
                startDelay: lastDelay + Math.floor(Math.random() * 25),
                speedY: randomNumber(0.0006, 0.0009),
                speedX: randomNumber(-0.00050, 0.00050),
                speedOpacity: 0.05,
                positionLimitY: 1.2
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
                return;
            }

            const point = particleConfig.particle.getPosition();

            point.setX(point.x + particleConfig.speedX);
            point.setY(point.y + particleConfig.speedY);

            let opacity = particleConfig.particle.getOpacity();
            if (opacity < 1) {
                opacity += particleConfig.speedOpacity;
                particleConfig.particle.setOpacity(opacity);
            }

            if (point.y > particleConfig.positionLimitY) {
                particleConfig.particle.setOpacity(0);
                particleConfig.particle.setPosition(this._origin);
                return;
            }

            particleConfig.particle.setPosition(point);
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
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    let pushValue = 0.01;

    document.addEventListener("audio-player", e => {
        pushValue = e.detail < 3 ? 0.01 : e.detail / 100;
        console.log("FFT:", pushValue);
    });
    /* cube - end */


    /* particles - start */
    const backgroundParticles = new BackgroundParticles(scene, camera, textureLoader, 300);
    /* particles - end */

    let delta = 0;
    async function animate() {
        const timeStart = Date.now();
        requestAnimationFrame(animate);

        backgroundParticles.process(delta);
        renderer.render(scene, camera);

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