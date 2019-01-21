const fs = require('fs');
const path = require('path');

const express = require('express');
const cors = require('cors');

const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') dotenv.config();

const multer = require('multer');

const pathUploads = 'uploads';
const upload = multer({ dest: `${pathUploads}/` });

const Sequelize = require('sequelize');
const models = require('./models');

const { Op } = Sequelize;

const imageToGcode = require('./util/imageToGcode');

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(cors());

app.get('/', (req, res) => res.send('Hello World!!!'));

app.get('/shops', async (req, res) => {
  const shops = await models.Shop.findAll();
  res.send(shops);
});

app.get('/shops/:id', async (req, res) => {
  const shop = await models.Shop.findOne({
    where: { code: { [Op.eq]: req.params.id } },
    attributes: ['id', 'code', 'name']
  });

  res.json(shop);
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const shop = await models.Shop.findOne({
    where: { code: { [Op.eq]: req.body.shopCode } },
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
