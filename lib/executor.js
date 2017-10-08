"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Executor {
    constructor(debounce, kill, commands) {
        this.debounce = debounce;
        this.kill = kill;
        this.commands = commands;
        this.last = 0;
        this.current = null;
        this.queue = [];
    }
    execute_commands(commands, callback) {
        if (commands.length === 0) {
            return callback(null);
        }
        commands[0].execute((err, proc) => {
            if (err) {
                return callback(err.toString());
            }
            if (proc === undefined) {
                return callback("BUG: Executor._execute: no error but proc === undefined");
            }
            this.current = proc;
            proc.stdout.on("data", data => console.log(data.toString().trim()));
            proc.stderr.on("data", data => console.error(data.toString().trim()));
            proc.on("close", (code, signal) => {
                if (code === null) {
                    return callback(`signal: ${signal}`);
                }
                if (code === 0) {
                    return this.execute_commands(commands.slice(1), callback);
                }
                else {
                    return callback(`command failure with exit code: ${code}`);
                }
            });
        });
    }
    _execute() {
        if (this.kill && this.current) {
            this.current.kill();
            this.queue.push(() => this._execute());
        }
        if (this.current) {
            return;
        }
        this.execute_commands([...this.commands], err => {
            if (err) {
                console.error(err);
            }
            this.current = null;
            while (true) {
                const task = this.queue.pop();
                if (task) {
                    task();
                }
                else {
                    break;
                }
            }
        });
    }
    execute() {
        const now = Date.now();
        if (this.last + this.debounce < now) {
            this.last = now;
        }
        else {
            return;
        }
        this._execute();
    }
}
exports.Executor = Executor;
