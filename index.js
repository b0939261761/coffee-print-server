'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') dotenv.config();

const app = express();
const port = process.env.APP_PORT || 3000;

const routes = require('./routes');

app.use(cors());

app.use('/', routes);

app.use((err, req, res, next) => {
  const errorCode = err.code || err.message;
  const errorMessage = errorCode !== err.message ? err.message : undefined;

  const statusCode = 422;
  res.status(statusCode).json({ code: errorCode, message: errorMessage });
});

app.listen(port, () => console.info(`💡 App listening on port ${port}!`));
