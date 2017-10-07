import { ArgumentParser } from "argparse";
import * as chokidar from "chokidar";

import { Executor } from "./executor";
import { Command, NormalCommand, JsonCommand } from "./command";

const parser = new ArgumentParser({});
parser.addArgument(["-i", "--initial"], { help: "run command initially", action: "storeTrue" });
parser.addArgument(["-d", "--debounce"], {
    help: "debounce (default: 0)",
    metavar: "msec",
    type: "int",
    defaultValue: 0,
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
    type: NormalCommand.parse,
});
parser.addArgument(["-j", "--json"], {
    dest: "commands",
    help: "commands from json",
    action: "append",
    defaultValue: [],
    type: JsonCommand.parse,
});
parser.addArgument(["-x", "--exclude"], {
    help: "exclude file regex",
    action: "store",
    defaultValue: undefined,
    type: (v: string) => new RegExp(v),
});

interface Args {
    debounce: number;
    initial: boolean;
    directories: string[];
    commands: Command[];
    exclude: null | RegExp;
}

(async () => {
    const args: Args = parser.parseArgs();

    const executor = new Executor(args.debounce, args.commands);
    if (args.initial) {
        await executor.execute();
    }

    const watcher = chokidar.watch(args.directories, { ignored: args.exclude });
    watcher.on("add", () => executor.execute());
    watcher.on("change", () => executor.execute());
})();
