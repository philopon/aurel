"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JsonPath = require("./parser");
const fs = require("fs");
const child_process_1 = require("child_process");
class Command {
    async execute() {
        const [cmd, args] = await this.commandargs();
        return await new Promise((resolve, reject) => {
            const c = child_process_1.spawn(cmd, args);
            c.stdout.on("data", data => console.log(data.toString().trim()));
            c.stderr.on("data", data => console.error(data.toString().trim()));
            c.on("close", code => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(code);
                }
            });
        });
    }
}
exports.Command = Command;
class NormalCommand extends Command {
    constructor(command, args) {
        super();
        this.command = command;
        this.args = args;
    }
    static parse(q) {
        const result = q.split(/\s+/);
        return new NormalCommand(result[0], result.slice(1));
    }
    async commandargs() {
        return [this.command, this.args];
    }
}
exports.NormalCommand = NormalCommand;
class JsonCommand extends Command {
    constructor(file, path) {
        super();
        this.file = file;
        this.path = path;
    }
    static parse(q) {
        const s = q.split(":");
        if (s.length === 2) {
            const [file, path] = s;
            return new JsonCommand(file, JsonPath.parse(path));
        }
        throw Error(`cannot parse json command: ${q}`);
    }
    getPath(obj) {
        for (const path of this.path) {
            if (path instanceof JsonPath.ObjectPath) {
                obj = obj[path.path];
            }
            else {
                obj = obj[path.index];
            }
        }
        return obj;
    }
    async commandargs() {
        const contents = await new Promise((resolve, reject) => {
            fs.readFile(this.file, "utf8", (err, text) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(JSON.parse(text));
                }
            });
        });
        const cmd = this.getPath(contents).split(/\s+/);
        return [cmd[0], cmd.slice(1)];
    }
}
exports.JsonCommand = JsonCommand;
