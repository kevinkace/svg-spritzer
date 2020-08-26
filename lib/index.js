"use strict";

const path = require("path");
const util = require("util");
const fs   = require("fs");

const readFile  = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const globule = require("globule");
const parser  = require("svg-parser");

const { EOL }    = require("os");
const doubleLine = new RegExp(`${EOL}${EOL}`, "g");

// input: array of SVG objects (`[{ name : "svg", properties : {}, children : [] }, {}])
// output: the sprited SVG object (same format as the input), all input SVGs within a `<symbol>`
function sprite(svgObjs) {
    const svg = {
        tagName    : "svg",
        children   : [],
        properties : {
            style         : "position: absolute; width: 0; height: 0;",
            width         : 0,
            height        : 0,
            version       : "1.1",
            xmlns         : "http://www.w3.org/2000/svg",
            "xmlns:xlink" : "http://www.w3.org/1999/xlink"
        }
    };

    // create a symbol for each icon, and push to svg.children
    svgObjs.forEach((svgObj) => {
        const _svg = svgObj.parsed.children
            .find(({ tagName }) => tagName === "svg");
        const { viewBox } = _svg.properties;
        const _children = _svg.children;

        const children = [{
                tagName  : "title",
                children : [ svgObj.id ]
            },
            ..._children
        ];
        const symbol = {
            tagName    : "symbol",
            children,
            properties : {
                id : svgObj.id,
                viewBox
            }
        };

        // add symbol to svg
        svg.children.push(symbol);
    });

    return svg;
}


// input: tag object
// output: SVG string of tag object, is called recursively on children
function render(el) {
    let rendered         = "",
        renderedChildren = "";

    if (typeof el === "string") {
        return el;
    }

    // start open tag
    rendered += `<${el.tagName}`;

    // attrs
    for (let attribute in (el.properties || {})) { // eslint-disable-line keyword-spacing
        rendered += ` ${attribute}="${el.properties[attribute]}"`;
    }

    // finish open tag
    rendered += ">";

    // recursive magic for children
    renderedChildren = (el.children || []).map(render).join(EOL);

    // formatting children
    if (renderedChildren.charAt(0) === "<") {
        renderedChildren = `${EOL}${renderedChildren}`;
    }

    // add children
    rendered += renderedChildren;

    // close tag
    rendered += `</${el.tagName}>${EOL}`;

    return rendered.replace(doubleLine, EOL);
}


// input: opts specifying file path, svg the SVG string
// output: promise of writing the file
function saveFile(opts, svg) {
    if (!opts || !opts.output) {
        return svg;
    }

    return writeFile(opts.output, svg);
}

// input: glob where to find SVGs to sprite, opts for where to write file
// output: promise of processing SVGs
module.exports = function(glob, opts) {
    return Promise.all(
            // read and parse all files found with glob
            globule.find(glob).map((file) =>
                readFile(file, "utf8")
                    .then((unparsed) => ({
                        id     : path.parse(file).name,
                        file,
                        unparsed,
                        parsed : parser.parse(unparsed)
                    }))
            )
        )
        .then(sprite)
        .then(render)
        .then(saveFile.bind(null, opts));
};
