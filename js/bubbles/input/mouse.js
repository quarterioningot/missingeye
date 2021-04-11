import * as THREE from "three";

class MouseManager {

    /**
     * @type {THREE.Vector2}
     * @private
     */
    _mouse = new THREE.Vector2(0, 0)

    /**
     * @type {boolean}
     * @private
     */
    _pressed = false;

    /**
     *
     * @type {THREE.Raycaster}
     * @private
     */
    _raycaster = new THREE.Raycaster();

    constructor() {
        document.addEventListener("mousemove", e => {
            this._mouse.x = e.clientX / window.innerWidth;
            this._mouse.y = e.clientY / window.innerHeight;
        }, false);

        document.addEventListener("mousedown", e => {
            this._pressed = true;
        }, false);

        document.addEventListener("mouseup", e => {
            this._pressed = true;
        }, false);
    }

    /**
     *
     * @param {number} delta
     */
    process(delta) {

    }

    getSceneObjects() {

    }

    /**
     *
     * @param {THREE.Scene} scene
     * @param {THREE.Camera} camera
     * @private
     */
    _processIntersections(scene, camera) {
        camera.updateMatrixWorld();
        this._raycaster.setFromCamera(this._mouse, camera);
        let intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {

        }
        else {

        }
    }

}

const MOUSE_MANAGER_INSTANCE = new MouseManager();

/**
 *
 * @returns {MouseManager}
 */
export function getMouseReference() {
    return MOUSE_MANAGER_INSTANCE;
}

/**
 *
 * @param {number} delta
 */
export function processMouse(delta) {
    MOUSE_MANAGER_INSTANCE.process(delta)
}
