"use strict";

const spritzer = require("../lib"),

    fsp = require("fs-promise"),

    glob     = "./test/fixtures/input/*.svg",
    expected = "./test/fixtures/output/expected.svg";

Promise.all([
        spritzer(glob),
        fsp.readFile(expected, "utf8")
    ])
    .then((data) => {
        console.log(data[0] === data[1]);
    })
    .catch((err) => {
        console.log(`Error: ${err}`);
    });
