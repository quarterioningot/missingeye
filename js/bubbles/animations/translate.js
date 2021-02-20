import * as THREE from "https://unpkg.com/three/build/three.module.js";
import {EASE_INOUT_QUAD, ease} from "./easing.js";

/**
 *
 * @type {TranslateVectorContext[]}
 */
const contexts = [];

/**
 * @typedef {Object} TranslateVectorOptions
 * @property {THREE.Vector3} fromVector
 * @property {THREE.Vector3} toVector
 * @property {THREE.Vector3} outVector
 * @property {number} duration
 */

class TranslateVectorContext {

    /**
     *
     * @type {number}
     * @private
     */
    _duration = 0;

    /**
     * @param {TranslateVectorOptions} options
     */
    constructor(options) {
        this._options = options;
        this._duration = options.duration;
    }

    /**
     *
     * @param {number} time
     * @param {number} delta
     */
    process(time, delta) {
        const x = this._easePoint(time, this._options.fromVector.x, this._options.toVector.x);
        const y = this._easePoint(time, this._options.fromVector.y, this._options.toVector.y);
        const z = this._easePoint(time, this._options.fromVector.z, this._options.toVector.z);

        this._options.outVector.setX(Math.abs(x));
        this._options.outVector.setY(y);
        this._options.outVector.setZ(z);
    }

    /**
     *
     * @param {number} time
     * @param {number} from
     * @param {number} to
     * @returns {number}
     * @private
     */
    _easePoint(time, from, to) {
        const changeInPoint = from - to;
        const currentTime = -Math.abs(1-this._duration);
        const result =  ease(
            EASE_INOUT_QUAD,
            currentTime,
            from,
            changeInPoint,
            this._duration
        );

        this._duration -= 1;

        return result;
    }

}


/**
 * Translates one vector to another within the given duration
 * @param {TranslateVectorOptions} options
 */
export function translateVector(options) {
    const context = new TranslateVectorContext(options);
    contexts.push(context);
}

/**
 *
 * @param {number} time
 * @param {number} delta
 */
export function process(time, delta) {
    for (const context of contexts) {
        context.process(time, delta);
    }
}