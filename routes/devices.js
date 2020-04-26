'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const routes = require('express').Router();
const models = require('../models');

const { Op } = models.Sequelize;

const pathUploads = process.env.APP_PATH_UPLOADS;
if (!fs.existsSync(pathUploads)) fs.mkdirSync(pathUploads);

// --------------------------------------------------------

routes.get('/:code', async (req, res) => {
  const device = await models.Device.findOne({
    where: { code: { [Op.eq]: req.params.code } },
    attributes: ['id', 'code', 'name']
  });

  res.json(device);
});

// --------------------------------------------------------

routes.get('/:id/pictures', async (req, res, next) => {
  const deviceId = req.params.id;

  if (!deviceId) next(new Error('MISSING_PARAMS'));

  const pictures = await models.Picture.findAll({
    where: { deviceId: { [Op.eq]: deviceId } },
    attributes: ['id']
  });

  const pictureList = pictures.map(({ id }) => id);
  res.json({ items: pictureList });
});

// --------------------------------------------------------

const fileFilter = async (req, file, next) => {
  const allowedTypes = ['image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return next(new Error('LIMIT_FILE_TYPES'));
  }

  const deviceId = req.params.id;
  if (!deviceId) next(new Error('MISSING_PARAMS'));

  const device = await models.Device.findOne({
    where: { id: { [Op.eq]: deviceId } },
    attributes: ['id', 'code', 'name']
  });

  if (!device) next(new Error('WRONG_PARAMS'));

  const filePath = path.join(pathUploads, req.params.id);
  if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

  const picture = await device.createPicture();

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

routes.post('/:id/pictures', upload.single('file'), (req, res) => {
  res.status(204).send();
});

// --------------------------------------------------------

routes.get('/:deviceId/pictures/:pictureId', (req, res, next) => {
  const { deviceId, pictureId } = req.params;

  if (!deviceId || !pictureId) next(new Error('MISSING_PARAMS'));

  const fullPath = path.join(__dirname, '..', pathUploads, deviceId, pictureId);

  if (!fs.existsSync(fullPath)) next(new Error('NOT_EXISTS_FILE'));

  res.sendFile(fullPath);
});

// --------------------------------------------------------

routes.delete('/:deviceId/pictures/:pictureId', async (req, res, next) => {
  const { pictureId } = req.params;
  if (!pictureId) next(new Error('MISSING_PARAMS'));

  const picture = await models.Picture.findOne({
    where: { id: { [Op.eq]: pictureId } },
    attributes: ['id', 'deviceId']
  });

  if (!picture) next(new Error('WRONG_PARAMS'));

  const fullPath = path.join(__dirname, '..', pathUploads, picture.deviceId.toString(), pictureId);
  try {
    if (!fs.existsSync(fullPath)) next(new Error('NOT_EXISTS_FILE'));
    fs.unlinkSync(fullPath);
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
