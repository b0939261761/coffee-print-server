module.exports = (sequelize, DataTypes) => sequelize.define(
  'App',
  { version: DataTypes.STRING },
  { freezeTableName: true }
);
