"use strict";

const spritzer = require("../lib"),

    fsp = require("fs-promise"),

    glob     = "./test/fixtures/input/*.svg",
    expected = "./test/fixtures/output/expected.svg",

    assert = require("assert");

describe("/lib/index.js", () => {
    it("should process icons that match the expected file", () => {
        return Promise.all([
            spritzer(glob),
            fsp.readFile(expected, "utf8")
        ])
        .then((data) => {
            assert.equal(data[0], data[1]);
        });
    });

    it("should process icons and write the output to a file", () => {
        const output = "./test/fixtures/output.svg";

        return Promise.all([
            spritzer(glob, { output }),
            fsp.readFile(expected, "utf8")
        ])
        .then((data) =>
            fsp.readFile(output, "utf8")
                .then((file) => {
                    assert.equal(data[1], file);
                })
        );
    });
});
