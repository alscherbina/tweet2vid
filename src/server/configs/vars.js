const dotenv = require('dotenv-safe');

dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT,
  logDirectoryName: 'log'
};
