const fs = require('fs')
const path = require('path');

const express = require('express');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const multer = require('multer');

const pathUploads = 'uploads';
const upload = multer({ dest: `${pathUploads}/` });

const models = require('./models');

const imageToGcode = require('./util/imageToGcode');

const app = express();
const port = process.env.APP_PORT || 3000;

app.get('/', (req, res) => res.send('Hello World!!!'));

app.get('/shop', async (req, res) => {
  const shops = await models.Shop.findAll();
  res.send(shops);
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const shop = await models.Shop.findOne({
    where: { code: req.body.shopCode },
    attributes: ['id']
  });

  if (!shop) {
    res.status(500).json({ code: 'NOT_EXISTS_CODE' });
    return;
  }

  const { pathFile } = req.file.path;

  await imageToGcode(pathFile);

  const picture = await shop.createPicture({
    originalFilename: req.file.originalname,
    description: req.body.description,
    path: pathFile
  });

  res.json({ status: true, picture: picture.id });
});


app.get('/file/:name', (req, res) => {
  const fileName = path.join(__dirname, pathUploads, req.params.name);
  // if (!fs.existsSync(fileName)) {
  //   res.sendStatus(404);
  //   return;
  // }

  res.sendFile(fileName);
});

app.listen(port, () => console.info(`💡 App listening on port ${port}!`));
