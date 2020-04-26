'use strict';

const routes = require('express').Router();
const devices = require('./devices');
const galleries = require('./galleries');
const app = require('./app');

routes.get('/', (req, res) => res.send('Whimsy'));

routes.use('/devices', devices);
routes.use('/galleries', galleries);
routes.use('/app', app);

module.exports = routes;
