const express = require('express');
const videoRouter = require('./videos.js');

const router = express.Router();

router.use('/videos', videoRouter);

module.exports = router;
