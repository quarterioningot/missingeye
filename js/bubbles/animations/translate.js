import * as THREE from "https://unpkg.com/three/build/three.module.js";
import {EASE_INOUT_QUAD, ease} from "./easing.js";

export const TRANSLATE_VECTOR_CONTEXT_STATE_STOPPED = 0;
export const TRANSLATE_VECTOR_CONTEXT_STATE_MOVING = 1;

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
     *
     * @type {number}
     * @private
     */
    _state = TRANSLATE_VECTOR_CONTEXT_STATE_MOVING;

    /**
     *
     * @type {number}
     * @private
     */
    _boost = 1;

    /**
     * @param {TranslateVectorOptions} options
     */
    constructor(options) {
        this._options = options;

        if (!this._options.outVector) {
            this._options.outVector = new THREE.Vector3(this._options.fromVector.x, this._options.fromVector.y, this._options.fromVector.z);
        }
    }

    start() {
        this._state = TRANSLATE_VECTOR_CONTEXT_STATE_MOVING;
    }

    stop() {
        this._state = TRANSLATE_VECTOR_CONTEXT_STATE_STOPPED;
    }

    reset() {
        this.setBoost(1);
        this._options.outVector.setX(this._options.fromVector.x);
        this._options.outVector.setY(this._options.fromVector.y);
        this._options.outVector.setZ(this._options.fromVector.z);
        this._duration = 0;
    }

    /**
     *
     * @param {number} time
     * @param {number} delta
     */
    process(time, delta) {
        if (this._state === TRANSLATE_VECTOR_CONTEXT_STATE_STOPPED) {
            return;
        }

        const x = this._easePoint(time, this._options.fromVector.x, this._options.toVector.x);
        const y = this._easePoint(time, this._options.fromVector.y, this._options.toVector.y);
        const z = this._easePoint(time, this._options.fromVector.z, this._options.toVector.z);

        if (this._duration >= this._options.duration) {
            this._state = TRANSLATE_VECTOR_CONTEXT_STATE_STOPPED;
        }

        this._options.outVector.setX(x);
        this._options.outVector.setY(y);
        this._options.outVector.setZ(z);
    }

    /**
     *
     * @returns {Vector3}
     */
    getResult() {
        return this._options.outVector;
    }

    /**
     *
     * @returns {number}
     */
    getState() {
        return this._state;
    }

    /**
     *
     * @param {number} boost
     */
    setBoost(boost) {
        if (boost <= 0) {
            return;
        }

        this._boost = boost;
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
        const changeInPoint = to - from;
        const result =  ease(
            EASE_INOUT_QUAD,
            this._duration,
            from,
            changeInPoint,
            this._options.duration
        );

        this._duration += this._boost;

        return result;
    }

}


/**
 * Translates one vector to another within the given duration
 * @param {TranslateVectorOptions} options
 * @returns {TranslateVectorContext}
 */
export function translateVector(options) {
    const context = new TranslateVectorContext(options);
    contexts.push(context);

    return context;
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