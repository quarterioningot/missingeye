import * as THREE from "https://unpkg.com/three/build/three.module.js";

export class TexturedParticleContainer {

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
     * }[]}
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

export class Particle {

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

    /***
     *
     * @param containerRef THREE.TexturedParticleContainer
     * @param index number
     * @param origin THREE.Vector3
     */
    constructor(containerRef, index, origin) {
        this._containerRef = containerRef;
        this._index = index;
        this._origin = new THREE.Vector3(origin.x, origin.y, origin.z);
    }

    /**
     * @param x, y number
     */
    setOrigin(x, y) {
        this._origin.setX(x);
        this._origin.setY(y)
        this._containerRef.setPointPosition(this._index, this._origin);
    }

    /**
     * @type THREE.PointsMaterial
     * @param materialRef
     */
    setMaterialRef(materialRef) {
        this._materialRef = materialRef;
    }

    /**
     *
     * @returns THREE.Vector3
     */
    getPosition() {
        return this._containerRef.getPointPosition(this._index);
    }

    /**
     *
     * @param point THREE.Vector3
     */
    setPosition(point) {
        this._containerRef.setPointPosition(this._index, point);
    }

    /**
     *
     * @returns {number}
     */
    getOpacity() {
        return this._materialRef.opacity;
    }

    /**
     *
     * @param opacity number
     */
    setOpacity(opacity) {
        this._materialRef.opacity = opacity;
    }

    resetPosition() {
        this.setPosition(this._origin);
    }

}