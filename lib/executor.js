"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Executor {
    constructor(debounce, kill, commands) {
        this.debounce = debounce;
        this.kill = kill;
        this.commands = commands;
        this.last = 0;
        this.current = null;
    }
    _execute(commands, callback) {
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
                this.current = null;
                if (code === null) {
                    return callback(`signal: ${signal}`);
                }
                if (code === 0) {
                    return this._execute(commands.slice(1), callback);
                }
                else {
                    return callback(`command failure with exit code: ${code}`);
                }
            });
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
        if (this.kill && this.current) {
            this.current.kill();
            this.current = null;
        }
        if (this.current) {
            return;
        }
        this._execute([...this.commands], err => {
            if (err) {
                console.error(err.toString());
            }
        });
    }
}
exports.Executor = Executor;
