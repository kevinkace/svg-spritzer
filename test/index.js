"use strict";

const spritzer = require("../lib"),
    glob = "./test/fixtures/*.svg",
    fsp  = require("fs-promise");

spritzer(glob)
    .then((data) => {
        console.log(data);

        return data;
    })
    .then(fsp.writeFile.bind(fsp,"asdf.svg"))
    .catch((err) => {
        console.log("ERr");
        console.log(err);

    });