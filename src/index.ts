import * as Canvas from "canvas";
import * as crypto from 'crypto';

Canvas.registerFont(require("path").resolve(__dirname, "../assets/Swift.ttf"), {
	family: "swift"
});

const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	       .replace(/[RGQIOVMI01]+/g, "");  // excludes

function randomize(seed: string, len?: number) {
  const sourceArray = seed.split('');
  let baselen = typeof len === 'undefined' ? sourceArray.length : len;
  const rnd = crypto.randomBytes(baselen);
  const result = [];
  let counter = 0, characterIndex, r;
  while (baselen > 0) {
    r = rnd[counter];
    characterIndex = r % sourceArray.length;
    result.push(sourceArray.splice(characterIndex, 1)[0]);
    baselen--;
    counter++;
  }
  return result.join('');
}

const randomText = (): string => {
  const alphaseed = randomize(alphanumeric);
  return randomize(alphaseed, 6);
};

const shuffleArray = (arr: number[]): number[] => {
		let i: number = arr.length,
			temp: number,
			randomIndex: number;
		// While there remain elements to shuffle...
		while (0 !== i) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * i);
			i -= 1;
			// And swap it with the current element.
			temp = arr[i];
			arr[i] = arr[randomIndex];
			arr[randomIndex] = temp;
		}
		return arr;
	};

class Captcha {
	private _canvas: Canvas.Canvas;
	private _value: string;
	private _color: string;

	constructor(
		_h: number = 120,
		_text?: string,
		_complexity?: {
			lines?: number;
			circleRadius?: number;
			foregroundNoise?: number;
		},
	) {
		// Make sure argument is a number, limit to a range from 250 to 400
		_h = typeof _h !== "number" || _h < 120 ? 120 : _h > 400 ? 400 : _h;

		// Initialize canvas
		this._canvas = Canvas.createCanvas(400, _h);

		// Initialize color
		{
			const c = 100;  // darkness factor - ensure only visible colors
			const r = 255 - c - Math.round(Math.random() * (255-c));
			const g = 255 - c - Math.round(Math.random() * (255-c));
			const b = 255 - c - Math.round(Math.random() * (255-c));
			this._color = `rgb(${r}, ${g}, ${b})`;
		}

		const ctx = this._canvas.getContext("2d");

		// Set background color
		ctx.globalAlpha = 1;
		ctx.fillStyle = "white";
		ctx.beginPath();
		ctx.fillRect(0, 0, 400, _h);
		ctx.save();

		// Scale down text for size
		let scaling = _h / 150;
		if (scaling > 1.3) scaling = 1.3;

		// Set style for lines
		ctx.strokeStyle = this._color;
		ctx.lineWidth = 4 * scaling;
		// Draw 10 lines
		ctx.beginPath();
		const coords: number[][] = [];
		for (let i = 0; i < 4; i++) {
			if (!coords[i]) coords[i] = [];
			for (let j = 0; j < (_complexity?.lines ?? 5); j++) coords[i][j] = Math.round(Math.random() * 80) + j * 80;
			if (!(i % 2)) coords[i] = shuffleArray(coords[i]);
		}
		for (let i = 0; i < coords.length; i++) {
			if (!(i % 2)) {
				for (let j = 0; j < coords[i].length; j++) {
					if (!i) {
						ctx.moveTo(coords[i][j], 0);
						ctx.lineTo(coords[i + 1][j], 400);
					} else {
						ctx.moveTo(0, coords[i][j]);
						ctx.lineTo(400, coords[i + 1][j]);
					}
				}
			}
		}
		ctx.stroke();

		// Set style for circles
		ctx.fillStyle = this._color;
		ctx.lineWidth = 0;
		// Draw circles
		for (let i = 0; i < 200; i++) {
			ctx.beginPath();
			ctx.arc(
				Math.round(Math.random() * 360) + 20, // X coordinate
				Math.round(Math.random() * 360) + 20, // Y coordinate
				Math.round(Math.random() * (_complexity?.circleRadius ?? 7) * scaling) + 1, // Radius
				0, // Start anglez
				Math.PI * 2 // End angle
			);
			ctx.fill();
		}

		// Set style for text
		ctx.fillStyle = this._color;
		// Set position for text
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.translate(0, _h);
		ctx.translate(
			Math.round(Math.random() * 40 - 20) + 30,
			-1 * Math.round(Math.random() * (_h / 8) - _h / 16) - _h / 2 + _h/8
		);
		ctx.rotate(0.3*(Math.random() - 0.5));
		// Set text value and print it to canvas
		ctx.beginPath();

		if (_text) {
			this._value = _text;
		} else {
			this._value = "";
			while (this._value.length !== 6) this._value = randomText();
		}

		let xCoord = 0;
		for (const chr of this._value) {
			const size = ((Math.random() - 0.5) * 40 + 70) * scaling;
			const font = chr.match(/[a-z]/i) ? 'swift' : 'serif';
			ctx.font = `bold ${size}px ${font}`;
			ctx.fillText(chr, xCoord, 0);
			xCoord += ctx.measureText(chr).width;
		}

		// Draw foreground noise
		ctx.restore();
		for (let i = 0; i < (_complexity?.foregroundNoise ?? 5000); i++) {
			ctx.beginPath();
			let color = "#";
			while (color.length < 7) color += Math.round(Math.random() * 16).toString(16);
			color += "a0";
			ctx.fillStyle = color;
			ctx.arc(
				Math.round(Math.random() * 400), // X coordinate
				Math.round(Math.random() * _h), // Y coordinate
				Math.random() * 2, // Radius
				0, // Start angle
				Math.PI * 2 // End angle
			);
			ctx.fill();
		}
	}

	get value(): string {
		return this._value;
	}

	get PNGStream(): Canvas.PNGStream {
		return this._canvas.createPNGStream();
	}

	get JPEGStream(): Canvas.JPEGStream {
		return this._canvas.createJPEGStream();
	}

	get dataURL(): string {
		return this._canvas.toDataURL("image/jpeg");
	}
}

export default Captcha;
