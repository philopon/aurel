"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JsonPath = require("./parser");
const fs = require("fs");
const child_process_1 = require("child_process");
class Command {
    async execute(callback) {
        this.commandargs((err, cmdargs) => {
            if (err) {
                return callback(err);
            }
            if (cmdargs === undefined) {
                return callback(new Error("BUG: Command.execute: no error but cmdargs === undefined"));
            }
            const [cmd, args] = cmdargs;
            return callback(null, child_process_1.spawn(cmd, args));
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
    commandargs(callback) {
        callback(null, [this.command, this.args]);
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
        if (s.length >= 2) {
            const path = s.slice(1).join(":");
            return new JsonCommand(s[0], JsonPath.parse(path));
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
    commandargs(callback) {
        fs.readFile(this.file, "utf8", (err, text) => {
            if (err) {
                callback(err);
            }
            else {
                const cmd = this.getPath(JSON.parse(text)).split(/\s+/);
                callback(null, [cmd[0], cmd.slice(1)]);
            }
        });
    }
}
exports.JsonCommand = JsonCommand;
