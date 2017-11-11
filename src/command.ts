import * as JsonPath from "./parser";
import * as fs from "fs";
import { spawn, ChildProcess } from "child_process";
import * as path from "path";
import * as findRoot from "find-root";

export abstract class Command {
    abstract commandargs(callback: (err: null | Error, cmd?: [string, string[]]) => void): void;

    async execute(callback: (err: null | Error, proc?: ChildProcess) => void): Promise<void> {
        this.commandargs((err, cmdargs) => {
            if (err) {
                return callback(err);
            }
            if (cmdargs === undefined) {
                return callback(
                    new Error("BUG: Command.execute: no error but cmdargs === undefined")
                );
            }
            const [cmd, args] = cmdargs;
            return callback(null, spawn(cmd, args));
        });
    }
}

export class NormalCommand extends Command {
    static parse(q: string): NormalCommand {
        const result = q.split(/\s+/);
        return new NormalCommand(result[0], result.slice(1));
    }
    constructor(public command: string, public args: string[]) {
        super();
    }

    commandargs(callback: (err: null | Error, cmd?: [string, string[]]) => void): void {
        callback(null, [this.command, this.args]);
    }
}

export class JsonCommand extends Command {
    static parse(q: string): JsonCommand {
        const s = q.split(":");
        if (s.length >= 2) {
            const path = s.slice(1).join(":");
            return new JsonCommand(s[0], JsonPath.parse(path));
        }
        throw Error(`cannot parse json command: ${q}`);
    }

    static parse_scripts(q: string): JsonCommand {
        const json = path.join(findRoot(process.cwd()), "package.json");
        return new JsonCommand(json, [
            new JsonPath.ObjectPath("scripts"),
            new JsonPath.ObjectPath(q),
        ]);
    }

    constructor(public file: string, public path: JsonPath.Path[]) {
        super();
    }

    getPath(obj: { [key: string]: any }): any {
        for (const path of this.path) {
            if (path instanceof JsonPath.ObjectPath) {
                obj = obj[path.path];
            } else {
                obj = obj[path.index];
            }
        }
        return obj;
    }

    commandargs(callback: (err: null | Error, cmd?: [string, string[]]) => void): void {
        fs.readFile(this.file, "utf8", (err, text) => {
            if (err) {
                callback(err);
            } else {
                const cmd = (this.getPath(JSON.parse(text)) as string).split(/\s+/);
                callback(null, [cmd[0], cmd.slice(1)]);
            }
        });
    }
}
