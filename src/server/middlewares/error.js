const httpStatus = require('http-status');
const config = require('../configs/vars');
const log = require('../configs/logger');

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
const handler = (err, req, res, next) => {
  const response = {
    code: err.code || err.status,
    message: err.message || httpStatus[err.status],
    errors: err.errors,
    stack: err.stack
  };

  log.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  if (config.env !== 'development') {
    delete response.stack;
  }

  res.status(err.status || 500);
  res.json(response);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
const notFound = (req, res, next) => {
  const err = {
    message: 'Not found',
    status: httpStatus.NOT_FOUND
  };
  return handler(err, req, res);
};

module.exports = { handler, notFound };
