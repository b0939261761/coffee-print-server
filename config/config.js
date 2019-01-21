
const defaultValue = {
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  dialect: 'postgres',
  operatorsAliases: false
};


module.exports = {
  development: {
    ...defaultValue,
    logging: console.info
  },
  test: {
    ...defaultValue
  },
  production: {
    ...defaultValue
  }
};
