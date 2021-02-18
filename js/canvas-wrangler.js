import * as THREE from "https://unpkg.com/three/build/three.module.js";
import { delay } from "./utils.js";

class TexturedParticleContainer {

    /**
     * @type THREE.Scene
     * @private
     */
    _scene;


    /**
     * @type THREE.PerspectiveCamera
     * @private
     */
    _camera;

    /**
     * @type number
     * @private
     */
    _count;

    /**
     * @type THREE.Points
     * @private
     */
    _particlePoints;

    /**
     * @type Particle[]
     * @private
     */
    _particles = [];

    _materialGroups;

    /**
     *
     * @param scene THREE.Scene
     * @param camera THREE.PerspectiveCamera
     * @param texture THREE.Texture
     * @param count number
     * @param materialGroups {{
     *     size: number,
     *     color: {
     *         r: number,
     *         g: number,
     *         b: number
     *     }
     *     texture: THREE.Texture,
     *     range: {
     *         start: number,
     *         stride: number
     *     }
     * }}[]
     */
    constructor(scene, camera, count, materialGroups) {
        this._scene = scene;
        this._camera = camera;
        this._count = count;
        this._materialGroups = materialGroups;

        this._init();
    }

    _init() {
        const particleGeometry = new THREE.BufferGeometry();
        const particleVertices = [];

        for (let i = 0; i < this._count; i++) {
            const vector = getSceneToWorld(Math.round(Math.random() * window.innerWidth), window.innerHeight + 200, this._camera)
            vector.setZ(-140);
            particleVertices.push(vector.x, vector.y, vector.z);

            this._particles.push(new Particle(this, i, vector))
        }

        particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particleVertices, 3));

        const materials = [];
        let materialGroupIndex = 0
        for (const materialGroup of this._materialGroups) {
            const particleMaterial = new THREE.PointsMaterial({
                size: materialGroup.size,
                map: materialGroup.texture,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            });
            particleMaterial.color.setHSL(materialGroup.color.r, materialGroup.color.g, materialGroup.color.b);
            materials.push(particleMaterial);

            particleGeometry.addGroup(materialGroup.range.start, materialGroup.range.stride, materialGroupIndex);
            materialGroupIndex++;
        }

        this._particlePoints = new THREE.Points(particleGeometry, materials);

        particleGeometry.computeVertexNormals();

        this._scene.add(this._particlePoints);
    }

    /**
     * @param pointIndex number
     * @returns {THREE.Vector3}
     */
    getPointPosition(pointIndex) {
        const positions = this._particlePoints.geometry.attributes.position.array;
        const index = pointIndex * 3;

        const x = positions[index];
        const y = positions[index+1];
        const z = positions[index+2];

        return new THREE.Vector3(x, y, z);
    }

    /**
     * @param pointIndex number
     * @param points THREE.Vector3
     */
    setPointPosition(pointIndex, points) {
        const positions = this._particlePoints.geometry.attributes.position.array;
        const index = pointIndex * 3;

        positions[index] = points.x;
        positions[index+1] = points.y;
        positions[index+2] = points.z;
    }

    /**
     * @returns {Particle[]}
     */
    getParticles() {
        return this._particles;
    }

    render() {
        this._particlePoints.geometry.attributes.position.needsUpdate = true;
        this._particlePoints.geometry.setDrawRange(0, this._count)
    }

}

class Particle {

    /**
     * @type TexturedParticleContainer
     * @private
     */
    _containerRef

    /**
     * @type index number
     * @private
     */
    _index

    /**
     * @type THREE.Vector3
     * @private
     */
    _origin;

    /**
     * @type number
     * @private
     */
    _speedX;

    /**
     * @type number
     * @private
     */
    _speedY;

    /***
     *
     * @param containerRef TexturedParticleContainer
     * @param index number
     * @param vector THREE.Vector3
     */
    constructor(containerRef, index, origin) {
        this._containerRef = containerRef;
        this._index = index;
        this._origin =  new THREE.Vector3(origin.x, origin.y, origin.z);
    }

    /**
     * @param speedX number
     * @param speedY number
     */
    setSpeed(speedX, speedY) {
        this._speedX = speedX;
        this._speedY = speedY;
    }

    /**
     * @param delta number
     */
    process(delta) {
        const point = this._containerRef.getPointPosition(this._index);

        point.setX(point.x + this._speedX);
        point.setY(point.y + this._speedY);

        if (point.y > 160) {
            this._containerRef.setPointPosition(this._index, this._origin);
            return;
        }

        this._containerRef.setPointPosition(this._index, point);
    }

}

export function LoadCanvasWrangler() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearAlpha(0);
    document.body.prepend(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    /* cube - start */
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    camera.position.z = 10;

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }, false);

    let pushValue = 0.01;

    document.addEventListener("audio-player", e => {
        pushValue = e.detail < 3 ? 0.01 : e.detail / 100;
        console.log("FFT:", pushValue);
    });
    /* cube - end */


    /* particles - start */
    const particleCount = 30;
    const particleSprites = [
        textureLoader.load("assets/textures/sprites/orb2.png"),
        textureLoader.load("assets/textures/sprites/orb3.png"),
        textureLoader.load("assets/textures/sprites/orb4.png")
    ];
    let particleMaterialGroups = [];
    for(let i  = 0; i < particleCount; i++) {
        particleMaterialGroups[i] = {
            size: Math.round(Math.random() * 20) + 200,
            texture: particleSprites[Math.floor(Math.random() * particleSprites.length)],
            color: {
                r: Math.random(),
                g: Math.random(),
                b: Math.random()
            },
            range: {
                start: i,
                stride: 1
            }
        }
    }

    const particleContainer = new TexturedParticleContainer(scene, camera, particleCount, particleMaterialGroups);
    const particles = particleContainer.getParticles();

    for (const particle of particles) {
        particle.setSpeed(randomNumber(-0.25, 0.25), randomNumber(0.1, 0.3));
    }
    /* particles - end */

    const releasedParticleIndices = [];

    async function particleReleaser() {
        await delay(Math.round(Math.random() * 250) + 250);

        const randomIndex = Math.round(Math.random() * (particles.length - 1));

        if (!releasedParticleIndices.includes(randomIndex)) {
            releasedParticleIndices.push(randomIndex);
        }

        if (releasedParticleIndices.length >= particles.length) {
            return;
        }

        requestAnimationFrame(particleReleaser);
    }

    async function animate() {
        requestAnimationFrame(animate);

        for (const releasedParticleIndex of releasedParticleIndices) {
            const particle = particles[releasedParticleIndex];
            try {
                particle.process(0);
            } catch (err) {
                console.log(err);
            }
        }

        particleContainer.render();
        renderer.render(scene, camera);
    }

    animate();
    particleReleaser();
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