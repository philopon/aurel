import { ArgumentParser } from "argparse";
import * as chokidar from "chokidar";

import { Executor } from "./executor";
import { Command, NormalCommand, JsonCommand } from "./command";

const parser = new ArgumentParser({});
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
    type: NormalCommand.parse,
});
parser.addArgument(["-j", "--json"], {
    dest: "commands",
    help: "commands from json",
    action: "append",
    metavar: "QUERY",
    defaultValue: [],
    type: JsonCommand.parse,
});
parser.addArgument(["-x", "--exclude"], {
    help: "exclude file regex",
    action: "store",
    metavar: "REGEXP",
    defaultValue: undefined,
    type: (v: string) => new RegExp(v),
});

interface Args {
    debounce: number;
    kill: boolean;
    directories: string[];
    commands: Command[];
    exclude: null | RegExp;
}

(async () => {
    const args: Args = parser.parseArgs();

    const executor = new Executor(args.debounce, args.kill, args.commands);

    const watcher = chokidar.watch(args.directories, { ignored: args.exclude });
    watcher.on("add", () => executor.execute());
    watcher.on("change", () => executor.execute());
})();
