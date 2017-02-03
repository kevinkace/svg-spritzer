"use strict";

const spritzer = require("../lib"),

    fsp = require("fs-promise"),

    glob     = "./test/fixtures/input/*.svg",
    expected = "./test/fixtures/output/expected.svg",

    assert = require("assert");

describe("/lib/index.js", () => {
    it("should process icons that match the expected file", () => {
        Promise.all([
            spritzer(glob),
            fsp.readFile(expected, "utf8")
        ])
        .then((data) => {
            assert.equal(data[0], data[1]);
        });
    });
});
