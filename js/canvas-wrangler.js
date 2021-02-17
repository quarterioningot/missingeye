import * as THREE from "https://unpkg.com/three/build/three.module.js";

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
     * @type THREE.Texture
     * @private
     */
    _texture;

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

    /**
     *
     * @param scene THREE.Scene
     * @param camera THREE.PerspectiveCamera
     * @param texture THREE.Texture
     * @param count number
     */
    constructor(scene, camera, texture, count) {
        this._scene = scene;
        this._camera = camera;
        this._texture = texture;
        this._count = count;

        this._init();
    }

    _init() {
        const particleGeometry = new THREE.BufferGeometry();
        const particleVertices = [];

        for (let i = 0; i < this._count; i++) {
            const vector = getSceneToWorld(Math.round(Math.random() * window.innerWidth), window.innerHeight, this._camera)
            particleVertices.push(vector.x, vector.y, -140);

            this._particles.push(new Particle(this, i, vector))
        }

        particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particleVertices, 3));

        const color = [1.0, 0.2, 0.5];
        const size = 10;

        const particleMaterial = new THREE.PointsMaterial({
            size: size,
            map: this._texture,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });
        particleMaterial.color.setHSL(color[0], color[1], color[2]);

        this._particlePoints = new THREE.Points(particleGeometry, particleMaterial);

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
    _vector;

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
    constructor(containerRef, index, vector) {
        this._containerRef = containerRef;
        this._index = index;
        this._vector = vector;
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
    const particleSprite = textureLoader.load("assets/textures/sprites/orb.png");
    const particleCount = 300;
    const particleContainer = new TexturedParticleContainer(scene, camera, particleSprite, particleCount);
    const particles = particleContainer.getParticles();

    for (const particle of particles) {
        particle.setSpeed(Math.random() - 0.5, (Math.random() / 2) + 0.3 );
    }
    /* particles - end */


    function animate() {
        requestAnimationFrame(animate);


        for (const particle of particles) {
            particle.process(0);
        }

        particleContainer.render();
        renderer.render(scene, camera);
    }

    animate();
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