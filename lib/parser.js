"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parjs_1 = require("parjs");
class ObjectPath {
    constructor(path) {
        this.path = path;
    }
}
exports.ObjectPath = ObjectPath;
class ArrayPath {
    constructor(index) {
        this.index = index;
    }
}
exports.ArrayPath = ArrayPath;
const object1 = parjs_1.Parjs.noCharOf(".[")
    .many(1)
    .str.map(v => new ObjectPath(v));
const object = parjs_1.Parjs.anyCharOf(".")
    .then(object1)
    .map(([_, v]) => v);
const array = parjs_1.Parjs.digit
    .many(1)
    .str.map(parseInt)
    .between(parjs_1.Parjs.whitespaces)
    .between(parjs_1.Parjs.anyCharOf("["), parjs_1.Parjs.anyCharOf("]"))
    .map(v => new ArrayPath(v));
const first = object1.or(array);
const rest = object.or(array);
exports.parser = first.then(rest.many()).map(([f, r]) => [f].concat(r));
function parse(s) {
    const result = exports.parser.parse(s);
    if (result.kind === "OK") {
        return result.value;
    }
    throw new parjs_1.ParsingFailureError(result);
}
exports.parse = parse;
