const tableName = 'Pictures';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(tableName, {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    originalFilename: {
      allowNull: false,
      type: Sequelize.STRING(254),
      defaultValue: ''
    },
    description: {
      allowNull: false,
      type: Sequelize.STRING(254),
      defaultValue: ''
    },
    path: {
      allowNull: false,
      type: Sequelize.STRING(254),
      defaultValue: ''
    },
    shopId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Shops',
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
