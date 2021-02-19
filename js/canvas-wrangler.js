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
     *         h: number,
     *         s: number,
     *         l: number
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
            const vector = new THREE.Vector3(0, 0, 0);
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
            particleMaterial.color.setHSL(materialGroup.color.h, materialGroup.color.s, materialGroup.color.l);
            particleMaterial.opacity = 0;
            materials.push(particleMaterial);

            particleGeometry.addGroup(materialGroup.range.start, materialGroup.range.stride, materialGroupIndex);

            for (let i = materialGroup.range.start; i < materialGroup.range.start + materialGroup.range.stride; i++) {
                this._particles[i].setMaterialRef(particleMaterial);
            }

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
     * @type THREE.TexturedParticleContainer
     * @private
     */
    _containerRef

    /**
     * @type THREE.PointsMaterial
     * @private
     */
    _materialRef

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

    /**
     * @type number
     * @private
     */
    _opacity;

    /**
     * @type number
     * @private
     */
    _limitY;

    /**
     * @type _startDelay
     * @private
     */
    _startDelay

    /***
     *
     * @param containerRef THREE.TexturedParticleContainer
     * @param index number
     * @param vector THREE.Vector3
     */
    constructor(containerRef, index, origin) {
        this._containerRef = containerRef;
        this._index = index;
        this._origin = new THREE.Vector3(origin.x, origin.y, origin.z);
    }

    /**
     * @param x, y number
     * @param speedY number
     */
    setOrigin(x, y) {
        this._origin.setX(x);
        this._origin.setY(y)
        this._containerRef.setPointPosition(this._index, this._origin);
    }

    /**
     * @param speedX number
     * @param speedY number
     */
    setSpeed(speedX, speedY, opacity) {
        this._speedX = speedX;
        this._speedY = speedY;
        this._opacity = opacity;
    }

    /**
     * @param limitY number
     */
    setYLimit(limitY) {
        this._limitY = limitY;
    }

    /**
     * @param delay number
     */
    setStartDelay(startDelay) {
        this._startDelay = startDelay;
    }

    /**
     * @type THREE.PointsMaterial
     * @param materialRef
     */
    setMaterialRef(materialRef) {
        this._materialRef = materialRef;
    }

    /**
     * @param delta number
     */
    process(delta) {
        if (this._startDelay > 0) {
            this._startDelay -= delta;
            return;
        }

        const point = this._containerRef.getPointPosition(this._index);

        point.setX(point.x + this._speedX);
        point.setY(point.y + this._speedY);

        if (this._materialRef.opacity < 1) {
            this._materialRef.opacity += this._opacity;
        }

        if (point.y > this._limitY) {
            this._materialRef.opacity = 0;
            this._containerRef.setPointPosition(this._index, this._origin);
            return;
        }

        this._containerRef.setPointPosition(this._index, point);
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
    const particleCount = 100;
    const particleSprites = [
        textureLoader.load("assets/textures/sprites/orb2.png"),
        textureLoader.load("assets/textures/sprites/orb3.png"),
        textureLoader.load("assets/textures/sprites/orb4.png")
    ];
    let particleMaterialGroups = [];
    for(let i  = 0; i < particleCount; i++) {
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

    const particleContainer = new TexturedParticleContainer(
        scene,
        camera,
        particleCount,
        particleMaterialGroups
    );
    const particles = particleContainer.getParticles();

    let lastDelay = 0;
    for (const particle of particles) {
        particle.setSpeed(randomNumber(-0.00050, 0.00050), randomNumber(0.0006, 0.0009), 0.05);
        particle.setYLimit(1.2);
        particle.setOrigin(Math.random(), 0);
        lastDelay += Math.floor(Math.random() * 50);
        particle.setStartDelay(lastDelay + Math.floor(Math.random() * 25));
    }
    /* particles - end */

    let delta = 0;
    async function animate() {
        requestAnimationFrame(animate);

        const timeStart = Date.now();
        for (const particle of particles) {
            try {
                particle.process(delta);
            } catch (err) {
                console.log(err);
            }
        }

        particleContainer.render();
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