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
    try {
      const mediaDescr = await videoService.downloadMedia(req.body.twitterPostURL);
      res.send(mediaDescr);
    } catch (err) {
      next(err);
    }
  } else {
    next({ status: httpStatus.BAD_REQUEST });
  }
});

/*
   Not really needed since express.static serves mp4 in pretty much the same way,
   so leaving this just for educational purposes
*/
router.get('/:mediaId.mp4', async (req, res) => {
  const path = videoService.getMediaPaths(req.params.mediaId).video;
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

router.delete('/:mediaId', async (req, res, next) => {
  try {
    await videoService.deleteMedia(req.params.mediaId);
    res.sendStatus(httpStatus.OK);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
