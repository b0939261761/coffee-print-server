const Jimp = require('jimp');

const fs = require('fs');

const convert = async (path, picSize) => {
  const image = await Jimp.read(path);

  image
    .resize(picSize, picSize)
    .write(`${path}_${picSize}.jpeg`);

  let fileTxtContent = '';
  let fileGcodeContent = 'G28 X0\nG28 Y0\nG28 Z0\nM106\nG1X80F10000\nG1Y40F10000\nG92 X0 Y0\n';
  const offset = 0.24;

  let currentOffsetX = -1;
  let currentOffsetY = -1;

  for (let y = 0, offsetY = 0; y < image.bitmap.height; y += 11, offsetY += offset * 12) {
    const arrayTxtContent = Array(image.bitmap.height - y > 13 ? 12 : image.bitmap.height - y).fill('');

    for (let x = 0, offsetX = 0; x < image.bitmap.width; ++x, offsetX += offset) {
      let valueBin = '';

      for (let i = y; i < y + 12 && i < image.bitmap.height; ++i) {
        const colorHex = image.getPixelColor(x, i);

        const {
          r: red, g: green, b: blue, a: alpha
        } = Jimp.intToRGBA(colorHex);

        // Алгоритм определения цвета
        const isWhite = ((red + green + blue) / 3) > 122.5 || alpha < 122.5;
        const pixelBin = isWhite ? '0' : '1';

        valueBin += pixelBin;
        arrayTxtContent[i - y] += pixelBin;
      }

      if (valueBin.length < 12) valueBin = valueBin.padEnd(12, '0');
      const valueDec = parseInt(valueBin, 2);

      if (valueDec) {
        let txtOffsetX = '';
        let txtOffsetY = '';

        if (currentOffsetX !== offsetX) {
          txtOffsetX = `X${offsetX.toFixed(6)}`;
          currentOffsetX = offsetX;
        }

        if (currentOffsetY !== offsetY) {
          txtOffsetY = `Y${offsetY.toFixed(6)}`;
          currentOffsetY = offsetY;
        }

        fileGcodeContent += `G1${txtOffsetX}${txtOffsetY}F10000\n`;
        fileGcodeContent += 'M400\n';
        fileGcodeContent += `M700 P0 S${valueDec}\n`;
      }
    }

    fileTxtContent += `${arrayTxtContent.join('\n')}\n`;
  }

  fileGcodeContent += 'M107\nG1Z200F1000\nG28 X0\nG28 Y0\nM84\n';

  fs.writeFileSync(`${path}_${picSize}.txt`, fileTxtContent);
  fs.writeFileSync(`${path}_${picSize}.gcode`, fileGcodeContent);
};

module.exports = async path => {
  await convert(path, 220);
  await convert(path, 250);
  await convert(path, 300);
  await convert(path, 500);
};
