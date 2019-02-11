module.exports = sequelize => {
  const Picture = sequelize.define('Picture', {}, {});
  Picture.associate = models => {
    Picture.belongsTo(models.Device, { foreignKey: 'deviceId' });
  };
  return Picture;
};
