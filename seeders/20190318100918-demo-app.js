const tableName = 'App';

module.exports = {
  up: queryInterface => queryInterface.bulkInsert(tableName, [{ version: '' }], {}),
  down: queryInterface => queryInterface.bulkDelete(tableName, null, {})
};
