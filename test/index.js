"use strict";

const spritzer = require("../lib"),
    glob = "./test/fixtures/*.svg";

spritzer(glob)
    .then((data) => {
        console.log(data);
    })
    .catch((err) => {
        console.log("ERr");
        console.log(err);
    });