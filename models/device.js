module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    code: DataTypes.STRING,
    name: DataTypes.STRING
  }, {});
  Device.associate = models => {
    Device.hasMany(models.Picture, { as: 'Pictures', foreignKey: 'deviceId' });
  };
  return Device;
};
