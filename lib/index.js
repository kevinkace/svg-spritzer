"use strict";

const path  = require("path"),

    fsp     = require("fs-promise"),
    globule = require("globule"),
    parser  = require("svg-parser");

function sprite(svgObjs) {
    const svg = [{
        name       : "svg",
        attributes : [{
            style         : "position: absolute; width: 0; height: 0;",
            width         : 0,
            height        : 0,
            version       : "1.1",
            xmlns         : "http://www.w3.org/2000/svg",
            "xmlns:xlink" : "http://www.w3.org/1999/xlink"
        }]
    }],
    defs = {
        name     : "defs",
        children : []
    };

    svgObjs.forEach((svgObj) => {
        let symbol = {
            name       : "symbol",
            attributes : {
                id       : svgObj.id,
                viewBox  : svgObj.parsed.attributes.viewBox,
                children : [{
                        name : "title",
                        children : [ svgObj.id ]
                    },
                    svgObj.parsed.children
                ]
            }
        };

        defs.children.push(symbol);
    });

    svg.push(defs);

    return svg;
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
        .then(sprite)
        .then((data) => {
            return data;
        });
};
