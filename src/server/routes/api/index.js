const express = require('express');
const videoRouter = require('./video.js');

const router = express.Router();

router.use('/video', videoRouter);

module.exports = router;
