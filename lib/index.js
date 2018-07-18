"use strict";

const path = require("path"),
    util   = require("util"),
    fs     = require("fs"),

    readFile  = util.promisify(fs.readFile),
    writeFile = util.promisify(fs.writeFile),

    globule = require("globule"),
    parser  = require("svg-parser"),

    eol        = "\n",
    doubleLine = new RegExp(eol + eol, "g");


// input: array of SVG objects (`[{ name : "svg", attributes : {}, children : [] }, {}])
// output: the sprited SVG object (same format as the input), all input SVGs within a `<symbol>`
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
    };

    // create a symbol for each icon, and push to svg.children
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
                    id      : svgObj.id,
                    viewBox : svgObj.parsed.attributes.viewBox
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

    if(typeof el === "string") {
        return el;
    }

    // start open tag
    rendered += `<${el.name}`;

    // attrs
    for(let attribute in (el.attributes || {})) { // eslint-disable-line keyword-spacing
        rendered += ` ${attribute}="${el.attributes[attribute]}"`;
    }

    // finish open tag
    rendered += ">";

    // recursive magic for children
    renderedChildren = (el.children || []).map(render).join(eol);

    // formatting children
    if(renderedChildren.charAt(0) === "<") {
        renderedChildren = `${eol}${renderedChildren}`;
    }

    // add children
    rendered += renderedChildren;

    // close tag
    rendered += `</${el.name}>${eol}`;

    return rendered.replace(doubleLine, eol);
}


// input: opts specifying file path, svg the SVG string
// output: promise of writing the file
function saveFile(opts, svg) {
    if(!opts || !opts.output) {
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
