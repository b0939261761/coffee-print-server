const tableName = 'Devices';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(tableName, {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    code: {
      allowNull: false,
      type: Sequelize.STRING(10),
      defaultValue: ''
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING(254),
      defaultValue: ''
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
