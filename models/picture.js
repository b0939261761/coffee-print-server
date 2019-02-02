module.exports = sequelize => {
  const Picture = sequelize.define('Picture', {}, {});
  Picture.associate = models => {
    Picture.belongsTo(models.Shop, { foreignKey: 'shopId' });
  };
  return Picture;
};
