module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define('Shop', {
    code: DataTypes.STRING,
    name: DataTypes.STRING
  }, {});
  Shop.associate = models => {
    Shop.hasMany(models.Picture, { as: 'Pictures', foreignKey: 'shopId' });
  };
  return Shop;
};
