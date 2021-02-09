export function LoadRollCommandEvent() {
    document.addEventListener("console-commander", e => {
        const commandArgs = e.detail;

        const verb = commandArgs.getVerb();
        if (verb !== "roll") {
            return;
        }

        let finalResult = 0;
        let nextOperation = "+";
        const dieDescriptors = commandArgs.getArgs();
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

        console.log("You rolled", finalResult);
    });
}

function rollDie(dieDescriptor) {
    const [dieCount, dieType] = dieDescriptor.split("d");

    let result = 0;
    for (let i = 0; i < dieCount; i++) {
        result += Math.round(Math.random() * dieType);
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