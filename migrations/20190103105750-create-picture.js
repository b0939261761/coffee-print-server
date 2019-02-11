const tableName = 'Pictures';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(tableName, {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    deviceId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Devices',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }).then(() => queryInterface.sequelize.query(`
    CREATE TRIGGER ${tableName}_update_at
    BEFORE UPDATE ON "${tableName}"
      FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp()
  `)),
  down: queryInterface => queryInterface.dropTable(tableName)
};
