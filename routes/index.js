const fs = require('fs');
const path = require('path');
const multer = require('multer');
const routes = require('express').Router();
const models = require('../models');
const imageToGcode = require('../utils/imageToGcode');

const { Op } = models.Sequelize;

const pathUploads = process.env.APP_PATH_UPLOADS;
if (!fs.existsSync(pathUploads)) fs.mkdirSync(pathUploads);

// --------------------------------------------------------

routes.get('/', (req, res) => res.send('Coffee Shop'));

// --------------------------------------------------------

routes.get('/shops/:code', async (req, res) => {
  const shop = await models.Shop.findOne({
    where: { code: { [Op.eq]: req.params.code } },
    attributes: ['id', 'code', 'name']
  });

  res.json(shop);
});

// --------------------------------------------------------

routes.get('/shops/:id/pictures', async (req, res, next) => {
  const shopId = req.params.id;
  const pictureId = req.query.id || 0;

  if (!shopId) next(new Error('MISSING_PARAMS'));

  const shop = await models.Shop.findOne({
    where: { id: { [Op.eq]: shopId } },
    attributes: ['id', 'code', 'name']
  });

  if (!shop) next(new Error('WRONG_PARAMS'));

  const pictures = await shop.getPictures({
    where: { id: { [Op.gt]: pictureId } },
    attributes: ['id']
  });

  const pictureList = pictures.map(({ id }) => id);
  res.json({ pictures: pictureList });
});

// --------------------------------------------------------

const fileFilter = async (req, file, next) => {
  const allowedTypes = ['image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return next(new Error('LIMIT_FILE_TYPES'));
  }

  const shopId = req.params.id;
  if (!shopId) next(new Error('MISSING_PARAMS'));

  const shop = await models.Shop.findOne({
    where: { id: { [Op.eq]: shopId } },
    attributes: ['id', 'code', 'name']
  });

  if (!shop) next(new Error('WRONG_PARAMS'));

  const filePath = `${pathUploads}/${req.params.id}`;
  if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

  const picture = await shop.createPicture();

  req.filePath = filePath;
  req.fileName = picture.id.toString();

  return next(null, true);
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, req.filePath);
  },
  filename(req, file, cb) {
    cb(null, req.fileName);
  }
});

const upload = multer({
  fileFilter,
  limits: { fileSize: process.env.APP_MAX_FILE_SIZE },
  storage
});

routes.post('/shops/:id/pictures', upload.single('file'), async (req, res) => {
  await imageToGcode(`${req.filePath}/${req.fileName}`);
  res.status(204).send();
});

// --------------------------------------------------------

routes.get('/shops/:shopId/pictures/:fileName', (req, res, next) => {
  const { shopId, fileName } = req.params;

  if (!shopId || !fileName) next(new Error('MISSING_PARAMS'));

  const fullPath = path.join(__dirname, '..', pathUploads, shopId, fileName);

  if (!fs.existsSync(fullPath)) next(new Error('NOT_EXISTS_FILE'));

  res.sendFile(fullPath);
});

// --------------------------------------------------------

routes.delete('/pictures/:id', async (req, res, next) => {
  const pictureId = req.params.id;
  if (!pictureId) next(new Error('MISSING_PARAMS'));

  const picture = await models.Picture.findOne({
    where: { id: { [Op.eq]: pictureId } },
    attributes: ['id', 'shopId']
  });

  if (!picture) next(new Error('WRONG_PARAMS'));

  const filePath = path.join(__dirname, '..', pathUploads, picture.shopId.toString());
  try {
    const files = fs.readdirSync(filePath);
    files.forEach(name => {
      const pattern = new RegExp(`^${pictureId}(_|$)`);
      if (pattern.test(name)) fs.unlinkSync(path.join(filePath, name));
    });

    await picture.destroy();
  } catch (err) {
    const error = new Error(err.message);
    error.code = 'DELETE';
    next(error);
    return;
  }
  res.status(204).send();
});


module.exports = routes;
