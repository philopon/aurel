import { Command } from "./command";

export class Executor {
    public last: number;
    public lock: boolean;

    constructor(public debounce: number, public commands: Array<Command>) {
        this.lock = false;
        this.last = 0;
    }

    async _execute() {
        const now = Date.now();
        if (this.last + this.debounce < now) {
            this.last = now;
        } else {
            return;
        }

        for (const command of this.commands) {
            try {
                await command.execute();
            } catch (e) {
                console.error(e);
                break;
            }
        }
    }

    async execute() {
        if (this.lock) {
            return;
        }
        this.lock = true;
        try {
            await this._execute();
        } finally {
            this.lock = false;
        }
    }
}
