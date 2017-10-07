import { Command } from "./command";

export class Executor {
    public last: number;

    constructor(public debounce: number, public commands: Array<Command>) {
        this.last = 0;
    }

    async execute() {
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
            }
        }
    }
}
