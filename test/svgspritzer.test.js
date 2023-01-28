"use strict";

const { readFile, unlink } = require("fs/promises");

const spritzer = require("../lib");

const glob     = "./test/fixtures/input/*.svg";
const expected = "./test/fixtures/output/expected.svg";
const output   = "./test/fixtures/output.svg";

describe("svg-spritzer", () => {
    beforeAll(async () => {
        try {
            await unlink(output);
        } catch (e) {
            if (e.message.indexOf("ENOENT:") !== 0) {
                throw e;
            }
            
            // file is already deleted, silently pass through
        }

        // as long as doesn't error 👍
    });
    
    it("should process icons that match the expected file", async () => {
        const sprite = await spritzer(glob);
        const result = await readFile(expected, "utf8");

        expect(sprite).toEqual(result);
    });

    it("should process icons and write the output to a file", async () => {
        await spritzer(glob, { output });

        const outputResult   = await readFile(output, "utf8");
        const expectedResult = await readFile(expected, "utf8");

        expect(outputResult).toEqual(expectedResult);
    });
});
