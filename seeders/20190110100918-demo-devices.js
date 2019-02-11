

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Devices', [
    {
      code: '1',
      name: 'Coffee Shop Lvov'
    },
    {
      code: '2',
      name: 'Coffee SHop Kiev'
    },
    {
      code: '3',
      name: 'Coffee Shop Rivne'
    },
    {
      code: '4',
      name: 'Coffee SHop Lutsk'
    }
  ], {}),

  down: queryInterface => queryInterface.bulkDelete('Devices', null, {})
};
