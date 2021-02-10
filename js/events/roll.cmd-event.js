import { delay } from "../utils.js";

export var ROLL_RESULT_EVENT = "cmd-result.roll"

const buffer = [];

export function LoadRollCommandEvent() {
    document.addEventListener("console-commander", e => {
        const commandArgs = e.detail;
        const verb = commandArgs.getVerb();
        if (verb !== "roll") {
            return;
        }

        buffer.push(commandArgs.getArgs())
    });

    tryNextInBuffer()
}

function tryNextInBuffer() {
    window.requestAnimationFrame(async () => {
        if (buffer.length) {
            const dieDescriptors = buffer.shift();
            processCommand(dieDescriptors);
        }

        await delay(250);
        tryNextInBuffer();
    })
}

function processCommand(dieDescriptors) {
    let finalResult = 0;
    let nextOperation = "+";
    for (let i = 0; i < dieDescriptors.length; i++) {
        const dieDescriptor = dieDescriptors[i];
        switch (dieDescriptor) {
            case "+":
            case "-":
                nextOperation = dieDescriptor
                break;

            default:
                finalResult = processDie(finalResult, rollDie(dieDescriptor), nextOperation);

        }
    }

    const rollEvent = new CustomEvent(ROLL_RESULT_EVENT, {
        detail: {
            roll: finalResult
        }
    })
    document.dispatchEvent(rollEvent)
}

function rollDie(dieDescriptor) {
    const [dieCount, dieType] = dieDescriptor.split("d");

    let result = 0;
    for (let i = 0; i < dieCount; i++) {
        result += Math.ceil(Math.random() * (dieType - 1) + 1);
    }

    return result;
}

function processDie(total, roll, operation) {
    switch (operation) {
        case "+":
            return total + roll;

        case "-":
            return total - roll
    }
}