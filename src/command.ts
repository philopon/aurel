import * as JsonPath from "./parser";
import * as fs from "fs";
import { spawn } from "child_process";

export abstract class Command {
    abstract async commandargs(): Promise<[string, string[]]>;

    async execute(): Promise<void> {
        const [cmd, args] = await this.commandargs();

        return await new Promise<void>((resolve, reject) => {
            const c = spawn(cmd, args);
            c.stdout.on("data", data => console.log(data.toString().trim()));
            c.stderr.on("data", data => console.error(data.toString().trim()));
            c.on("close", code => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(code);
                }
            });
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

    async commandargs(): Promise<[string, string[]]> {
        return [this.command, this.args];
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

    async commandargs(): Promise<any> {
        const contents = await new Promise<{ [key: string]: any }>((resolve, reject) => {
            fs.readFile(this.file, "utf8", (err, text) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(text));
                }
            });
        });
        const cmd = (this.getPath(contents) as string).split(/\s+/);
        return [cmd[0], cmd.slice(1)];
    }
}
