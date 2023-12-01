"use strict";
const assert = require("assert");
const Canvas = require("canvas");
const Captcha = require("../").default;
const fs = require("fs");
const path = require("path");

describe("src/index.ts", function () {
	describe("Captcha", function () {
		it("should export function 'captcha'", function () {
			assert.strictEqual(typeof Captcha, "function");
		});

		const captcha = new Captcha();
		describe("captcha", function () {
			it("should export an object", function () {
				assert.strictEqual(typeof captcha, "object");
			});

			describe("value", function () {
				it("should be a string", function () {
					assert.strictEqual(typeof captcha.value, "string");
				});
				it("should be 6 characters long", function () {
					assert.strictEqual(captcha.value.length, 6);
				});
			});

			describe("PNGStream", function () {
				it("should be an instance of canvas PNG Stream", function () {
					assert.strictEqual(captcha.PNGStream instanceof Canvas.PNGStream, true);
				});
			});

			describe("JPEGStream", function () {
				it("should be an instance of canvas JPEG Stream", function () {
					assert.strictEqual(captcha.JPEGStream instanceof Canvas.JPEGStream, true);
				});
			});

			describe("dataURL", function () {
				it("should be a string", function () {
					assert.strictEqual(typeof captcha.dataURL, "string");
				});
			});
		});
	});
});

describe("file creation", function () {
	before(function (done) {
		require("../examples/writeToFiles");

		this.timeout(5000);
		setTimeout(done, 2000);
	});

	it("should create a new JPEG file", function () {
		const files = fs
			.readdirSync(path.join(__dirname, "..", "examples"))
			.filter(f => ["png", "jpeg"].includes(f.split(".")[1]));

		assert.strictEqual(Boolean(files.filter(f => f.endsWith(".jpeg")).length), true);
	});
});
