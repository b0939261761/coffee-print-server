'use strict';

module.exports = (sequelize, DataTypes) => sequelize.define(
  'App',
  { version: DataTypes.INTEGER },
  { freezeTableName: true }
);
