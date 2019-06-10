const express = require('express');
const httpStatus = require('http-status');
const fs = require('fs');
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

router.get('/:mediaId', async (req, res) => {
  const path = videoService.getVideoFilePath(req.params.mediaId);
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    };

    res.writeHead(httpStatus.PARTIAL_CONTENT, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(httpStatus.OK, head);
    fs.createReadStream(path).pipe(res);
  }
});

module.exports = router;
