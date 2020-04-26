'use strict';

module.exports = (sequelize, DataTypes) => {
  const GalleryCategory = sequelize.define('GalleryCategory', {
    num: DataTypes.INTEGER,
    name: DataTypes.STRING,
    visible: DataTypes.BOOLEAN
  }, {});
  GalleryCategory.associate = models => {
    GalleryCategory.hasMany(
      models.GalleryPicture,
      { as: 'GalleryPictures', foreignKey: 'galleryCategoryId' }
    );
  };
  return GalleryCategory;
};
