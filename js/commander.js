const argumentSplitter = /("[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^\/\\]*(?:\\[\S\s][^\/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S)+)/g;
const template = `
<span>&gt;</span>
<input type="text" id="console-input" class="console-input" placeholder="Site design by human" />
`

class ConsoleArgument {

    _command = ""
    _verb = ""
    _args = []
    _argsMap = {}
    _argsIgnored = []

    constructor(command) {
        this._command = command

        this._process();
    }

    _process() {
        const explodedCommand = this._command.split(argumentSplitter).filter(s => {
            return s && s !== " ";
        });

        this._verb = explodedCommand[0];
        const args = explodedCommand.slice(1, explodedCommand.length)

        let index = 0;
        let processingSwitches = false;
        while (index < args.length) {
            const arg = args[index];
            if (this._testSwitch(arg)) {
                processingSwitches = true;

                const equalIndex = arg.indexOf("=");
                if (equalIndex >= 0) {
                    const key = arg.slice(0, equalIndex);
                    this._argsMap[key] = arg.slice(equalIndex + 1, arg.length);
                    index++
                    continue;
                }

                const nextArg = args[index + 1];
                if (this._testSwitch(nextArg)) {
                    index++;
                    this._argsMap[arg] = true;
                    continue;
                }

                index+=2;
                this._argsMap[arg] = nextArg;
                continue;
            }

            if (processingSwitches) {
                this._argsIgnored.push(arg);
            } else {
                this._args.push(arg);
            }

            index++;
        }
    }

    _testSwitch(arg) {
        return arg && arg.startsWith("-") || arg.startsWith("--")
    }

    getVerb() {
        return this._verb;
    }

    getArgs() {
        return this._args;
    }

    getSwitch(key) {
        return this._argsMap[key];
    }

    getIgnored(key) {
        return this._argsIgnored;
    }

}

class ConsoleCommander extends HTMLElement {

    _consoleInput

    constructor() {
        super();

        this.innerHTML = template

        this._consoleInput = document.querySelector("#console-input");

        if (!this._consoleInput) {
            return;
        }

        this._consoleInput.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.keyCode === 13) {
                e.preventDefault()
            }
        });

        this._consoleInput.addEventListener("keyup", e => {
            if (e.key === "Enter" || e.keyCode === 13) {
                e.preventDefault()
                this._onEnter();
            }
        });
    }

    _onEnter() {
        const command = this._consoleInput.value;
        this._consoleInput.value = ""

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