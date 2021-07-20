// Import the module
const Captcha = require("../").default;

const path = require("path"),
	fs = require("fs");

fs.readdir(__dirname, (err, files) => {
  if (err) throw err;

  for (const file of files) {
    if (file.endsWith('.jpeg'))
      fs.unlink(path.join(__dirname, file), err => {
        if (err) throw err;
      });
  }
});

for (let i = 0; i < 10; i++) {
	let captcha = new Captcha();
	console.log(captcha.value);
	captcha.JPEGStream.pipe(fs.createWriteStream(path.join(__dirname, `${captcha.value}.jpeg`)));
}