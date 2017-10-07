import { Parjs, LoudParser, ParsingFailureError } from "parjs";

export type Path = ObjectPath | ArrayPath;

export class ObjectPath {
    constructor(public path: string) {}
}

export class ArrayPath {
    constructor(public index: number) {}
}

const object1 = Parjs.noCharOf(".[")
    .many(1)
    .str.map(v => new ObjectPath(v));

const object = Parjs.anyCharOf(".")
    .then(object1)
    .map(([_, v]) => v);

const array = Parjs.digit
    .many(1)
    .str.map(parseInt)
    .between(Parjs.whitespaces)
    .between(Parjs.anyCharOf("["), Parjs.anyCharOf("]"))
    .map(v => new ArrayPath(v));

const first = object1.or(array);
const rest = object.or(array);
export const parser: LoudParser<Path[]> = first.then(rest.many()).map(([f, r]) => [f].concat(r));

export function parse(s: string): Path[] {
    const result = parser.parse(s);
    if (result.kind === "OK") {
        return result.value;
    }
    throw new ParsingFailureError(result);
}
