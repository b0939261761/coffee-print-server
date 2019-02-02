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
  // if (err.code === 'LIMIT_FILE_TYPES') {
  //   res.status(422).json({ code: err.code, message: err.message });
  // }

  const errorCode = err.code || err.message;
  const errorMessage = errorCode !== err.message ? err.message : undefined;

  let statusCode;
  switch (errorCode) {
    case 'MISSING_PARAMS':
      statusCode = 400;
      break;
    case 'WRONG_PARAMS':
      statusCode = 422;
      break;
    default:
      statusCode = 404;
  }

  //
  res.status(statusCode).json({ code: errorCode, message: errorMessage });
});

app.listen(port, () => console.info(`💡 App listening on port ${port}!`));
