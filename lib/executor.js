"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Executor {
    constructor(debounce, commands) {
        this.debounce = debounce;
        this.commands = commands;
        this.lock = false;
        this.last = 0;
    }
    async _execute() {
        const now = Date.now();
        if (this.last + this.debounce < now) {
            this.last = now;
        }
        else {
            return;
        }
        for (const command of this.commands) {
            try {
                await command.execute();
            }
            catch (e) {
                console.error(e);
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
        }
        finally {
            this.lock = false;
        }
    }
}
exports.Executor = Executor;
