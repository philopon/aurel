# aurel
[![npm](https://img.shields.io/npm/v/aurel.svg)](https://www.npmjs.com/package/aurel)

auto reload daemon

# install
```console
$ npm install -g aurel
```

# how to use
```console
% ./bin/aurel --help
usage: aurel [-h] [-k] [-d MSEC] [-w DIR] [-c COMMAND] [-j QUERY] [-x REGEXP]

Optional arguments:
  -h, --help            Show this help message and exit.
  -k, --kill            kill previous process when file changed
  -d MSEC, --debounce MSEC
                        debounce (default: 1000)
  -w DIR, --directory DIR
                        directories to watch
  -c COMMAND, --command COMMAND
                        commands
  -j QUERY, --json QUERY
                        commands from json
  -x REGEXP, --exclude REGEXP
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
