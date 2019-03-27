const routes = require('express').Router();
const devices = require('./devices');
const app = require('./app');

routes.get('/', (req, res) => res.send('Whimsy'));

routes.use('/devices', devices);
routes.use('/app', app);

module.exports = routes;
