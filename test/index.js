"use strict";

const spritzer = require("../lib");

const { promisify }             = require("util");
const { readFile : fsReadFile } = require("fs");

const readFile = promisify(fsReadFile);

const normalizeNewline = require("normalize-newline");

const glob     = "./test/fixtures/input/*.svg";
const expected = "./test/fixtures/output/expected.svg";

const assert = require("assert");

describe("/lib/index.js", () => {
    it("should process icons that match the expected file", () =>
        Promise.all([
                spritzer(glob),
                readFile(expected, "utf8")
            ])
            .then(data => {
                assert.equal(normalizeNewline(data[0]), normalizeNewline(data[1]));
            })
    );

    it("should process icons and write the output to a file", () => {
        const output = "./test/fixtures/output.svg";

        return Promise.all([
                spritzer(glob, { output }),
                readFile(expected, "utf8")
            ])
            .then(data =>
                readFile(output, "utf8")
                    .then((file) => {
                        assert.equal(normalizeNewline(data[1]), normalizeNewline(file));
                    })
            );
    });
});
