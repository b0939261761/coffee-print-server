'use strict';

const tableName = 'App';

module.exports = {
  up: queryInterface => queryInterface.bulkInsert(tableName, [{ version: 0 }], {}),
  down: queryInterface => queryInterface.bulkDelete(tableName, null, {})
};
