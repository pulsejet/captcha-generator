// Import the module
const Captcha = require("../").default;
const { promisify } = require("util");

const path = require("path"),
	fs = require("fs");

fs.readdir(__dirname, async (err, files) => {
  if (err) throw err;

  for (const file of files) {
    if (file.endsWith('.jpeg'))
      await promisify(fs.unlink)(path.join(__dirname, file));
  }

  for (let i = 0; i < 10; i++) {
    let captcha = new Captcha();
    console.log(captcha.value);
    captcha.JPEGStream.pipe(fs.createWriteStream(path.join(__dirname, `${captcha.value}.jpeg`)));
  }
});