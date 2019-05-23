'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const util = require('util');
const routes = require('express').Router();
const ApkReader = require('adbkit-apkreader');
const models = require('../models');
const compareVersion = require('../utils/compareVersion');

const { Op } = models.Sequelize;
const rename = util.promisify(fs.rename);

const pathApp = 'app';
const pathUploads = path.join(__dirname, '..', process.env.APP_PATH_UPLOADS, pathApp);
const pathTmp = path.join(__dirname, '..', 'tmp');
const filenameApp = 'whimsy.apk';
const fullPathApp = path.join(pathUploads, filenameApp);
const fullPathAppTmp = path.join(pathTmp, filenameApp);

const fileFilter = (req, file, next) => {
  if (file.mimetype !== 'application/vnd.android.package-archive') {
    return next(new Error('LIMIT_FILE_TYPES'));
  }

  if (!fs.existsSync(pathTmp)) fs.mkdirSync(pathTmp);
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
    if (!fs.existsSync(pathUploads)) fs.mkdirSync(pathUploads);
    await rename(fullPathAppTmp, fullPathApp);
    const reader = await ApkReader.open(fullPathApp);
    const manifest = await reader.readManifest();
    const { versionName } = manifest;
    await models.App.update({ version: versionName }, { where: { id: { [Op.eq]: 1 } } });
  } catch (err) {
    next(new Error(err));
  }
  res.status(204).send();
});

routes.get('/check/:version', async (req, res, next) => {
  const { version } = req.params;
  const app = await models.App.findOne({ where: { id: { [Op.eq]: 1 } }, attributes: ['version'] });
  const status = compareVersion(app.version, version) > 0;
  res.send({ status });
});

routes.get('/upgrade', async (req, res, next) => {
  res.sendFile(fullPathApp);
});

module.exports = routes;
