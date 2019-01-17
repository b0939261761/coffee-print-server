module.exports = (sequelize, DataTypes) => {
  const Picture = sequelize.define('Picture', {
    originalFilename: DataTypes.STRING,
    description: DataTypes.STRING,
    path: DataTypes.STRING
  }, {});
  Picture.associate = models => {
    Picture.belongsTo(models.Shop, { foreignKey: 'shopId' });
  };
  return Picture;
};
