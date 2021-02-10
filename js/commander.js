const argumentSplitter = /("[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^\/\\]*(?:\\[\S\s][^\/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S)+)/g;
const template = `
<span>&gt;</span>
<input type="text" id="console-input" class="console-input" placeholder="Site design by human" />
`

class ConsoleArgument {

    #command = ""
    #verb = ""
    #args = []
    #argsMap = {}
    #argsIgnored = []

    constructor(command) {
        this.#command = command

        this.#process();
    }

    #process() {
        const explodedCommand = this.#command.split(argumentSplitter).filter(s => {
            return s && s !== " ";
        });

        this.#verb = explodedCommand[0];
        const args = explodedCommand.slice(1, explodedCommand.length)

        let index = 0;
        let processingSwitches = false;
        while (index < args.length) {
            const arg = args[index];
            if (this.#testSwitch(arg)) {
                processingSwitches = true;

                const equalIndex = arg.indexOf("=");
                if (equalIndex >= 0) {
                    const key = arg.slice(0, equalIndex);
                    this.#argsMap[key] = arg.slice(equalIndex + 1, arg.length);
                    index++
                    continue;
                }

                const nextArg = args[index + 1];
                if (this.#testSwitch(nextArg)) {
                    index++;
                    this.#argsMap[arg] = true;
                    continue;
                }

                index+=2;
                this.#argsMap[arg] = nextArg;
                continue;
            }

            if (processingSwitches) {
                this.#argsIgnored.push(arg);
            } else {
                this.#args.push(arg);
            }

            index++;
        }
    }

    #testSwitch(arg) {
        return arg && arg.startsWith("-") || arg.startsWith("--")
    }

    getVerb() {
        return this.#verb;
    }

    getArgs() {
        return this.#args;
    }

    getSwitch(key) {
        return this.#argsMap[key];
    }

    getIgnored(key) {
        return this.#argsIgnored;
    }

}

class ConsoleCommander extends HTMLElement {

    #consoleInput

    constructor() {
        super();

        this.innerHTML = template

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
        const command = this.#consoleInput.value;
        this.#consoleInput.value = ""

        const commandArgs = new ConsoleArgument(command);
        const event = new CustomEvent("console-commander", {
            detail: commandArgs
        });

        document.dispatchEvent(event)
    }
}

export function LoadCommander() {
    customElements.define("console-commander", ConsoleCommander);
}