const express = require('express');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const error = require('../middlewares/error');
const log = require('./logger');

const app = express();

// TODO use general log for requests logging for now, should be separate log in future
app.use(morgan('combined', { stream: log.stream }));

app.use(express.static('public'));
app.use(express.json());

// gzip compression
app.use(compression());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.get('/api', (req, res) => res.send('API root endpoint'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only in development mode
app.use(error.handler);

module.exports = app;
