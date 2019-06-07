const app = require('./configs/express');
const log = require('./configs/logger');
const config = require('./configs/vars');

app.listen(config.port, async () => {
  log.info(`App started on port ${config.port}`);
});
