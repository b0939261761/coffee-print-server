const express = require('express');

require('dotenv').config();

const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const models = require('./models');

const imageToGcode = require('./util/imageToGcode');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Hello World!'));

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

  const { path } = req.file;

  await imageToGcode(path);

  await shop.createPicture({
    originalFilename: req.file.originalname,
    description: req.body.description,
    path
  });

  res.send('Done');
});

app.listen(port, () => console.info(`💡 App listening on port ${port}!`));
