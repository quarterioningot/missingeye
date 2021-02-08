class ConsoleArgument {

    #command = ""
    #verb = ""
    #args = []

    constructor(command) {
        this.#command = command

        this.#process();
    }

    #process() {
        const explodedCommand = this.#command.split(" ");

        this.#verb = explodedCommand[0];
        this.#args = explodedCommand.slice(1, explodedCommand.length)
    }

    getVerb() {
        return this.#verb;
    }

    getArgs() {
        return this.#args;
    }

}

class ConsoleCommander extends HTMLElement {

    #consoleInput

    constructor() {
        super();

        this.#consoleInput = document.querySelector("#console-input");

        if (!this.#consoleInput) {
            return;
        }

        this.#consoleInput.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.keyCode === 13) {
                e.preventDefault()
            }
        });

        this.#consoleInput.addEventListener("keyup", e => {
            if (e.key === "Enter" || e.keyCode === 13) {
                e.preventDefault()
                this.#onEnter();
            }
        });
    }

    #onEnter() {
        const command = this.#consoleInput.innerText;
        this.#consoleInput.innerText = ""

        const commandArgs = new ConsoleArgument(command);
        console.log(commandArgs);
    }
}

export function LoadCommander() {
    customElements.define("console-commander", ConsoleCommander);
}