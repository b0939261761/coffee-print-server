module.exports = (sequelize, DataTypes) => {
  const Picture = sequelize.define('Picture', {
    path: DataTypes.STRING
  }, {});
  Picture.associate = models => {
    Picture.belongsTo(models.Shop, { foreignKey: 'shopId' });
  };
  return Picture;
};
