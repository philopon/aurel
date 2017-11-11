"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const argparse_1 = require("argparse");
const chokidar = require("chokidar");
const executor_1 = require("./executor");
const command_1 = require("./command");
const parser = new argparse_1.ArgumentParser({});
parser.addArgument(["-k", "--kill"], {
    help: "kill previous process when file changed",
    action: "storeTrue",
});
parser.addArgument(["-d", "--debounce"], {
    help: "debounce (default: 100)",
    metavar: "MSEC",
    type: "int",
    defaultValue: 100,
});
parser.addArgument(["-w", "--directory"], {
    dest: "directories",
    help: "directories to watch",
    action: "append",
    metavar: "DIR",
    defaultValue: [],
});
parser.addArgument(["-c", "--command"], {
    dest: "commands",
    help: "commands",
    action: "append",
    metavar: "COMMAND",
    defaultValue: [],
    type: command_1.NormalCommand.parse,
});
parser.addArgument(["-j", "--json"], {
    dest: "commands",
    help: "commands from json",
    action: "append",
    metavar: "QUERY",
    defaultValue: [],
    type: command_1.JsonCommand.parse,
});
parser.addArgument(["-s", "--scripts"], {
    dest: "commands",
    help: "commands from npm scripts",
    action: "append",
    metavar: "QUERY",
    defaultValue: [],
    type: command_1.JsonCommand.parse_scripts,
});
parser.addArgument(["-x", "--exclude"], {
    help: "exclude file regex",
    action: "store",
    metavar: "REGEXP",
    defaultValue: undefined,
    type: (v) => new RegExp(v),
});
(async () => {
    const args = parser.parseArgs();
    const executor = new executor_1.Executor(args.debounce, args.kill, args.commands);
    const watcher = chokidar.watch(args.directories, { ignored: args.exclude });
    watcher.on("add", () => executor.execute());
    watcher.on("change", () => executor.execute());
})();
