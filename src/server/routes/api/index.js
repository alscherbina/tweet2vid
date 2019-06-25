const express = require('express');
const videoRouter = require('./videos.js');
//const botRouter = require('./telegram.bot.js');

const router = express.Router();

router.use('/videos', videoRouter);
//router.use('/bot', botRouter);

module.exports = router;
