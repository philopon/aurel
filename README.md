# aurel
auto reload daemon

# install
```console
$ npm install -g aurel
```

# how to use
```console
% aurel --help
usage: aurel [-h] [-k] [-d MSEC] [-w DIRECTORIES] [-c COMMANDS] [-j COMMANDS]
             [-x EXCLUDE]


Optional arguments:
  -h, --help            Show this help message and exit.
  -k, --kill            kill previous process when file changed
  -d MSEC, --debounce MSEC
                        debounce (default: 1000)
  -w DIRECTORIES, --directory DIRECTORIES
                        directories to watch
  -c COMMANDS, --command COMMANDS
                        commands
  -j COMMANDS, --json COMMANDS
                        commands from json
  -x EXCLUDE, --exclude EXCLUDE
                        exclude file regex
```

# examples

restart `node lib` (web server) when a file in lib directory exclude static is written

```console
% aurel -w lib -c 'node lib' -k -x 'static'
```

run build:sass rule of npm-script when a file in sass directory is written

```console
% aurel -w sass -j 'package.json:scripts.build:sass'
```
