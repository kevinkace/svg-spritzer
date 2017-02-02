"use strict";

const path  = require("path"),

    fsp     = require("fs-promise"),
    globule = require("globule"),
    parser  = require("svg-parser");

function render(svgObjs) {
    let rendered = "<defs>";

    svgObjs.forEach((svgObj) => {
        let symbol = `<symbol id=${svgObj.id}>`;

        symbol += JSON.stringify(svgObj.parsed.children);

        symbol += `</symbol>`;

        rendered += symbol;
    });

    rendered += "</defs>\n";

    return rendered;
}

module.exports = function(glob, opts) {
    return Promise.all(
            globule.find(glob).map((file) =>
                fsp.readFile(file, "utf8")
                    .then((unparsed) => ({
                        id : path.parse(file).filename,
                        file,
                        unparsed
                    }))
            )
        )
        .then((svgObjs) =>
            svgObjs.map((svgObj) => {
                svgObj.parsed = parser.parse(svgObj.unparsed);

                return svgObj;
            })
        )
        .then(render)
        .then((data) => {
            return data;
        });
};
