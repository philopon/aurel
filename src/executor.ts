import { Command } from "./command";
import { ChildProcess } from "child_process";

export class Executor {
    public last: number = 0;
    public current: ChildProcess | null = null;

    constructor(public debounce: number, public kill: boolean, public commands: Array<Command>) {}

    _execute(commands: Command[], callback: (err: null | string) => void): void {
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
                } else {
                    return callback(`command failure with exit code: ${code}`);
                }
            });
        });
    }

    execute() {
        const now = Date.now();
        if (this.last + this.debounce < now) {
            this.last = now;
        } else {
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
