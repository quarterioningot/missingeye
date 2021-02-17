import * as THREE from "https://unpkg.com/three/build/three.module.js";

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

    const particleGeometry = new THREE.BufferGeometry();
    const particleVertices = [];

    const particleSprite = textureLoader.load("assets/textures/sprites/orb.png");

    const particlePoints = 300;
    for (let i = 0; i < particlePoints; i++) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;

        const vector = getSceneToWorld(Math.round(Math.random() * window.innerWidth), window.innerHeight, camera)

        particleVertices.push(vector.x, vector.y, -140);
    }

    particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particleVertices, 3));

    const color = [1.0, 0.2, 0.5];
    const size = 10;

    const particleMaterial = new THREE.PointsMaterial({
        size: size,
        map: particleSprite,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true
    });
    particleMaterial.color.setHSL(color[0], color[1], color[2]);

    const particles = new THREE.Points(particleGeometry, particleMaterial);

    //particles.rotation.x = Math.random() * 6;
    //particles.rotation.y = Math.random() * 6;
    //particles.rotation.z = Math.random() * 6;

    scene.add(particles);

    /* particles - end */


    function animate() {
        requestAnimationFrame(animate);

        const time = Date.now() * 0.00005;

        const h = (360 * (color[0] + time) % 360) / 360;
        particleMaterial.color.setHSL(h, color[1], color[2]);

        cube.rotation.x += pushValue;
        cube.rotation.y += pushValue;

        const particlePositions = particles.geometry.attributes.position.array;
        for (let coordIndex = 1; coordIndex < particlePositions.length; coordIndex+=3) {
            let coord = particlePositions[coordIndex];
            coord += Math.random() / 10;
            particlePositions[coordIndex] = coord;
        }

        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.setDrawRange(0, particlePoints)
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