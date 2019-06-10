const express = require('express');
const httpStatus = require('http-status');
const videoService = require('../../model/video.service');

const router = express.Router();

router.get('/', async (req, res) => {
  const mediaList = await videoService.listMedia();
  res.send(mediaList);
});

router.post('/task', async (req, res, next) => {
  if (req.body.twitterPostURL) {
    const mediaDescr = await videoService.downloadMedia(req.body.twitterPostURL);
    res.send(mediaDescr);
  } else {
    next({ status: httpStatus.BAD_REQUEST });
  }
});

module.exports = router;
