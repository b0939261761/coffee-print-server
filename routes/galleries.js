'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const fsPromises = require('fs').promises;
const routes = require('express').Router();
const models = require('../models');

const pathGalleries = path.join(__dirname, '..', process.env.APP_PATH_GALLERIES);
if (!fs.existsSync(pathGalleries)) fs.mkdirSync(pathGalleries);

const pathGalleryCategories = path.join(pathGalleries, process.env.APP_PATH_GALLERY_CATEGORIES);
if (!fs.existsSync(pathGalleryCategories)) fs.mkdirSync(pathGalleryCategories);

const pathGalleryPictures = path.join(pathGalleries, process.env.APP_PATH_GALLERY_PICTURES);
if (!fs.existsSync(pathGalleryPictures)) fs.mkdirSync(pathGalleryPictures);

const allowedTypes = ['image/jpeg', 'image/jpg'];

const storageCategory = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pathGalleryCategories),
  filename: (req, file, cb) => cb(null, req.categoryId.toString())
});

// -- GET CATEGORY ------------------------------------------------------

routes.get('', async (req, res, next) => {
  const category = await models.GalleryCategory.findAll({
    where: { visible: true },
    order: ['num'],
    attributes: ['id', 'name']
  });

  res.json({ items: category });
});

// -- GET CATEGORY PICTURE ------------------------------------------------------

routes.get('/categories/:pictureId', (req, res, next) => {
  const fullPath = path.join(pathGalleryCategories, req.params.pictureId);

  if (!fs.existsSync(fullPath)) return res.sendStatus(404);

  res.sendFile(fullPath);
});

// -- CREATE CATEGORY ------------------------------------------------------

const fileFilterCreateCategory = async (req, file, next) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return next(new Error('LIMIT_FILE_TYPES'));
  }

  const { num, visible, name } = req.body;
  if (!name) next(new Error('MISSING_PARAMS'));

  const category = await models.GalleryCategory.create({ num, visible, name });
  req.categoryId = category.id;

  return next(null, true);
};

const uploadCreateCategory = multer({
  fileFilter: fileFilterCreateCategory,
  limits: { fileSize: process.env.APP_MAX_FILE_SIZE },
  storage: storageCategory
});

const afterUploadCreateCategory = (req, res, next) => {
  if (!req.file) next(new Error('MISSING_PARAMS'));
  next();
};

routes.post(
  '',
  uploadCreateCategory.single('file'),
  afterUploadCreateCategory,
  (req, res) => res.json({ id: req.categoryId })
);

// -- UPDATE CATEGORY ------------------------------------------------------

const updateCategory = async (req, next) => {
  const { id } = req.params;
  const { num, visible, name } = req.body;

  let result = null;
  if (num || visible || name) {
    const category = await models.GalleryCategory.update(
      { num, visible, name }, { returning: true, where: { id } }
    );
    ({ 0: result } = category);
  } else {
    result = await models.GalleryCategory.findOne({ where: { id }, attributes: ['id'] });
  }

  if (!result) return next(new Error('WRONG_PARAMS'));
  req.categoryId = id;
  return id;
};

const fileFilterUpdateCategory = async (req, file, next) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return next(new Error('LIMIT_FILE_TYPES'));
  }

  await updateCategory(req, next);

  return next(null, true);
};

const uploadUpdateCategory = multer({
  fileFilter: fileFilterUpdateCategory,
  limits: { fileSize: process.env.APP_MAX_FILE_SIZE },
  storage: storageCategory
});

const afterUploadUpdateCategory = async (req, res, next) => {
  if (!req.file) await updateCategory(req, next);
  next();
};

routes.patch(
  '/:id',
  uploadUpdateCategory.single('file'),
  afterUploadUpdateCategory,
  (req, res) => res.json({ id: req.categoryId })
);

// -- DELETE CATEGORY ------------------------------------------------------

routes.delete(
  '/:id',
  async (req, res, next) => {
    const { id } = req.params;

    await models.GalleryCategory.destroy({ where: { id } });

    try {
      await fsPromises.unlink(path.join(pathGalleryCategories, id));
    } catch (err) {
      if (err.code !== 'ENOENT') return next(new Error(err));
    }

    return res.json({ id });
  }
);

// --------------------------------------------
// --------------------------------------------
// --------------------------------------------

const storagePicture = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pathGalleryPictures),
  filename: (req, file, cb) => cb(null, req.pictureId.toString())
});

// -- GET PICTURE ------------------------------------------------------

routes.get('/:galleryCategoryId/pictures', async (req, res, next) => {
  const items = await models.GalleryPicture.findAll({
    where: { galleryCategoryId: req.params.galleryCategoryId, visible: true },
    order: ['num'],
    attributes: ['id']
  });

  res.json({ items: items.map(({ id }) => id) });
});


// -- GET PICTURE PICTURE ------------------------------------------------------

routes.get('/pictures/:pictureId', (req, res, next) => {
  const fullPath = path.join(pathGalleryPictures, req.params.pictureId);

  if (!fs.existsSync(fullPath)) return res.sendStatus(404);

  res.sendFile(fullPath);
});

// -- CREATE PICTURE ----------------------------------------------------

const fileFilterCreatePicture = async (req, file, next) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return next(new Error('LIMIT_FILE_TYPES'));
  }

  const category = await models.GalleryCategory.findOne({
    where: { id: req.params.galleryCategoryId }, attributes: ['id']
  });

  if (!category) next(new Error('WRONG_PARAMS'));

  const { num, visible } = req.body;

  const picture = await category.createGalleryPicture({ num, visible });
  req.pictureId = picture.id;

  return next(null, true);
};

const uploadCreatePicture = multer({
  fileFilter: fileFilterCreatePicture,
  limits: { fileSize: process.env.APP_MAX_FILE_SIZE },
  storage: storagePicture
});

const afterUploadCreatePicture = (req, res, next) => {
  if (!req.file) next(new Error('MISSING_PARAMS'));
  next();
};

routes.post(
  '/:galleryCategoryId/pictures',
  uploadCreatePicture.single('file'),
  afterUploadCreatePicture,
  (req, res) => res.json({ id: req.pictureId })
);

// -- UPDATE PICTURE ------------------------------------------------------

const updatePicture = async (req, next) => {
  const { id, galleryCategoryId } = req.params;
  const { num, visible } = req.body;

  let result = null;
  if (num || visible) {
    const picture = await models.GalleryPicture.update(
      { num, visible }, { returning: true, where: { id, galleryCategoryId } }
    );
    ({ 0: result } = picture);
  } else {
    result = await models.GalleryPicture.findOne({
      where: { id, galleryCategoryId }, attributes: ['id']
    });
  }

  if (!result) return next(new Error('WRONG_PARAMS'));
  req.pictureId = id;
  return id;
};

const fileFilterUpdatePicture = async (req, file, next) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return next(new Error('LIMIT_FILE_TYPES'));
  }

  await updatePicture(req, next);

  return next(null, true);
};

const uploadUpdatePicture = multer({
  fileFilter: fileFilterUpdatePicture,
  limits: { fileSize: process.env.APP_MAX_FILE_SIZE },
  storage: storagePicture
});

const afterUploadUpdatePicture = async (req, res, next) => {
  if (!req.file) await updatePicture(req, next);
  next();
};

routes.patch(
  '/:galleryCategoryId/pictures/:id',
  uploadUpdatePicture.single('file'),
  afterUploadUpdatePicture,
  (req, res) => res.json({ id: req.pictureId })
);

// -- DELETE PICTURE ------------------------------------------------------

routes.delete(
  '/:galleryCategoryId/pictures/:id',
  async (req, res, next) => {
    const { id, galleryCategoryId } = req.params;

    await models.GalleryPicture.destroy({ where: { id, galleryCategoryId } });

    try {
      await fsPromises.unlink(path.join(pathGalleryPictures, id));
    } catch (err) {
      if (err.code !== 'ENOENT') return next(new Error(err));
    }

    return res.json({ id });
  }
);

module.exports = routes;
