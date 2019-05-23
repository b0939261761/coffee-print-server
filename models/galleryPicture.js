'use strict';

module.exports = (sequelize, DataTypes) => {
  const GalleryPicture = sequelize.define(
    'GalleryPicture',
    {
      num: DataTypes.INTEGER,
      visible: DataTypes.BOOLEAN
    },
    {}
  );
  GalleryPicture.associate = models => {
    GalleryPicture.belongsTo(models.GalleryCategory, { foreignKey: 'galleryCategoryId' });
  };
  return GalleryPicture;
};
