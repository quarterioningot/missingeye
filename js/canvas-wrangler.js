import * as THREE from "three";
import {FloatingBokeh} from "./bubbles/particles/presets/floating-bokeh.js"
import {ShootingBokeh} from "./bubbles/particles/presets/shooting-bokeh.js"
import {process} from "./bubbles/animations/translate.js"

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

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    /* particles - start */
    const floatingBokehParticles = new FloatingBokeh(scene, camera, textureLoader, 200);
    const shootingBokehParticles = new ShootingBokeh(scene, camera, textureLoader, 100);

    document.addEventListener("audio-player", e => {
        if (e.detail < 7) {
            return;
        }

        shootingBokehParticles.releaseBokeh(1);
    });
    /* particles - end */

    document.addEventListener("console-commander", e => {
        const commandArgs = e.detail;
        const verb = commandArgs.getVerb();
        if (verb !== "bokeh") {
            return;
        }

        const args = commandArgs.getArgs();
        if (args[0] !== "shoot") {
            return;
        }

        let count = 0;
        if (!args[1] || !(count = parseInt(args[1])) || count <= 0) {
            return;
        }

        shootingBokehParticles.releaseBokeh(count);
    });

    let delta = 0;

    async function animate() {
        const timeStart = Date.now();
        requestAnimationFrame(animate);

        process(timeStart, delta);

        floatingBokehParticles.process(delta);
        shootingBokehParticles.process(delta);

        renderer.render(scene, camera);

        delta = Date.now() - timeStart;
    }

    animate();
}