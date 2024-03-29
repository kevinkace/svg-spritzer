# svg-spritzer
[![build badge](https://github.com/kevinkace/svg-spritzer/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/kevinkace/posthtml-pseudo/actions/workflows/npm-publish.yml)

*Note:* I made this before finding out about [svgstore](https://github.com/svgstore/svgstore), you probably want that instead.

![](https://media.giphy.com/media/3orif3jbFCSDlr9G3m/giphy.gif)

Sprite SVGs into a single SVG like this:

```html
<svg style="position: absolute; width: 0; height: 0;"
width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink">
    <symbol id="icon1" viewBox="0 0 32 32">
        <title>icon1</title>
        <path d="M18 15l7 7h-5v8h-4v-8h-5l7-7z"></path>
    </symbol>
    <symbol id="icon2" viewBox="0 0 32 32">
        <title>icon2</title>
        <path d="M18 10l4 4-8 8-4-4zM31.298 12z"></path>
    </symbol>
</svg>
```

So you can use them like this:

```html
<button>
    <svg viewBox="0 0 32 32">
        <title>icon 1</title>
        <use xlink:href="/icons.svg#icon1"></use>
    </svg>
</button>
```

And you make it like this:

```js
const svgSpritzer = require("svg-spritzer"),
    glob = "**/*.svg";

svgSpritzer(glob)
    .then((data) => {
        // data is a string of sprited SVG
    });
```

Or like this:

```js
svgSpritzer([
    "./icons.svg",
    "!output.svg"
], {
    output : "./output.svg"
});
```
