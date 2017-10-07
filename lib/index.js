"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const argparse_1 = require("argparse");
const chokidar = require("chokidar");
const executor_1 = require("./executor");
const command_1 = require("./command");
const parser = new argparse_1.ArgumentParser({});
parser.addArgument(["-i", "--initial"], { help: "run command initially", action: "storeTrue" });
parser.addArgument(["-d", "--debounce"], {
    help: "debounce (default: 1000)",
    metavar: "msec",
    type: "int",
    defaultValue: 1000,
});
parser.addArgument(["-w", "--directory"], {
    dest: "directories",
    help: "directories to watch",
    action: "append",
    defaultValue: [],
});
parser.addArgument(["-c", "--command"], {
    dest: "commands",
    help: "commands",
    action: "append",
    defaultValue: [],
    type: command_1.NormalCommand.parse,
});
parser.addArgument(["-j", "--json"], {
    dest: "commands",
    help: "commands from json",
    action: "append",
    defaultValue: [],
    type: command_1.JsonCommand.parse,
});
parser.addArgument(["-x", "--exclude"], {
    help: "exclude file regex",
    action: "store",
    defaultValue: undefined,
    type: (v) => new RegExp(v),
});
(async () => {
    const args = parser.parseArgs();
    const executor = new executor_1.Executor(args.debounce, args.commands);
    if (args.initial) {
        await executor.execute();
    }
    const watcher = chokidar.watch(args.directories, { ignored: args.exclude });
    watcher.on("add", () => executor.execute());
    watcher.on("change", () => executor.execute());
})();
