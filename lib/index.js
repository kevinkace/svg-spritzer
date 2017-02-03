"use strict";

const path  = require("path"),

    fsp     = require("fs-promise"),
    globule = require("globule"),
    parser  = require("svg-parser");

function sprite(svgObjs) {
    const svg = {
            name       : "svg",
            children   : [],
            attributes : {
                style         : "position: absolute; width: 0; height: 0;",
                width         : 0,
                height        : 0,
                version       : "1.1",
                xmlns         : "http://www.w3.org/2000/svg",
                "xmlns:xlink" : "http://www.w3.org/1999/xlink"
            }
        },
        defs = {
            name     : "defs",
            children : []
        };

    // create a symbol for each icon, and push to defs.children
    svgObjs.forEach((svgObj) => {
        let children = [{
                    name     : "title",
                    children : [ svgObj.id ]
                },
                ...svgObj.parsed.children
            ],
            symbol = {
                name       : "symbol",
                children,
                attributes : {
                    id       : svgObj.id,
                    viewBox  : svgObj.parsed.attributes.viewBox
                }
            };

        defs.children.push(symbol);
    });

    // add defs to svg
    svg.children.push(defs);

    return svg;
}

function render(el) {
    let rendered         = "",
        renderedChildren = "";

    if(typeof el === "string") {
        return el;
    }

    // start open tag
    rendered += `<${el.name}`;

    // attrs
    for(let attribute in (el.attributes || {})) {
        rendered += ` ${attribute}="${el.attributes[attribute]}"`;
    }

    // finish open tag
    rendered += ">";

    // recursive magic for children
    renderedChildren = (el.children || []).map(render).join("\n");

    // formatting children
    if(renderedChildren.charAt(0) === "<") {
        renderedChildren = `\n${renderedChildren}`;
    }

    // add children
    rendered += renderedChildren;

    // close tag
    rendered += `</${el.name}>\n`;

    return rendered.replace(/\n\n/g, "\n");
}

module.exports = function(glob, opts) {
    return Promise.all(
        // read and parse all files found with glob
        globule.find(glob).map((file) =>
            fsp.readFile(file, "utf8")
                .then((unparsed) => ({
                    id     : path.parse(file).name,
                    file,
                    unparsed,
                    parsed : parser.parse(unparsed)
                }))
        )
    )
    .then(sprite)
    .then(render);
};
