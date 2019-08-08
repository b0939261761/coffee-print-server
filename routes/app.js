'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const routes = require('express').Router();
const fsPromises = require('fs').promises;
const ApkReader = require('adbkit-apkreader');
const models = require('../models');

const pathApp = 'app';
const pathUploads = path.join(__dirname, '..', process.env.APP_PATH_UPLOADS, pathApp);
const pathTmp = path.join(__dirname, '..', 'tmp');
const filenameApp = 'whimsy.apk';
const fullPathApp = path.join(pathUploads, filenameApp);
const fullPathAppTmp = path.join(pathTmp, filenameApp);

if (!fs.existsSync(pathTmp)) fs.mkdirSync(pathTmp);
if (!fs.existsSync(pathUploads)) fs.mkdirSync(pathUploads);

const fileFilter = (req, file, next) => {
  if (file.mimetype !== 'application/vnd.android.package-archive') {
    return next(new Error('LIMIT_FILE_TYPES'));
  }

  return next(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pathTmp),
  filename: (req, file, cb) => cb(null, filenameApp)
});

const upload = multer({
  fileFilter,
  limits: { fileSize: process.env.APP_MAX_APP_FILE_SIZE },
  storage
});

routes.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    await fsPromises.rename(fullPathAppTmp, fullPathApp);
    const reader = await ApkReader.open(fullPathApp);
    const manifest = await reader.readManifest();
    await models.App.update({ version: manifest.versionCode }, { where: { id: 1 } });
  } catch (err) {
    return next(new Error(err));
  }
  return res.status(204).send();
});

routes.get('/check/:version', async (req, res, next) => {
  const app = await models.App.findOne({ where: { id: 1 }, attributes: ['version'] });
  // Убрать костыль после того как будет обновление '030010' (req.params.version <= 3)
  const status = req.params.version <= 3 || req.params.version < app.version;
  res.send({ status });
});

routes.get('/upgrade', async (req, res, next) => {
  res.sendFile(fullPathApp);
});

module.exports = routes;
