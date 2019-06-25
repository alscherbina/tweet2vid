/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const needle = require('needle');
const fs = require('fs');
const stream = require('stream');
const util = require('util');
const path = require('path');
const logger = require('../configs/logger');

const pipeline = util.promisify(stream.pipeline);

require('dotenv-safe').config();

const videoDir = process.env.VIDEO_DIR;
const defaultHeaders = {
  authorization: `Bearer ${process.env.BEARER_TOKEN}`
};

if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir);
}

async function downloadFile(uri, filename) {
  return pipeline(needle.get(uri), fs.createWriteStream(filename));
}

async function getTweet(tweetId) {
  const response = await needle(
    'get',
    'https://api.twitter.com/1.1/statuses/show.json',
    { id: tweetId },
    { headers: defaultHeaders }
  );
  return response.body;
}

function chooseBestQualityMp4URL(variants) {
  let result = variants.filter(item => {
    return item.content_type === 'video/mp4';
  });
  result = result.reduce((res, item) => {
    if (!res.bitrate || res.bitrate < item.bitrate) {
      return item;
    }
    return res;
  }, {});
  return result.url;
}

async function downloadMedia(twitterPostURL) {
  const tweetPathName = new URL(twitterPostURL).pathname;
  const tweetId = tweetPathName.slice(tweetPathName.lastIndexOf('/') + 1);
  const result = {
    videoFile: `${videoDir}/${tweetId}.mp4`,
    thumbnailFile: `${videoDir}/${tweetId}.jpg`
  };
  const tweet = await getTweet(tweetId);
  if (tweet && tweet.extended_entities && tweet.extended_entities.media) {
    const thumbnailURL = tweet.extended_entities.media[0].media_url;
    const thumbnailDownloadPromise = downloadFile(thumbnailURL, result.thumbnailFile);

    const videoURL = chooseBestQualityMp4URL(tweet.extended_entities.media[0].video_info.variants);
    const videoDownloadPromise = downloadFile(videoURL, result.videoFile);

    await Promise.all([thumbnailDownloadPromise, videoDownloadPromise]);
  } else {
    throw Error(`Can't load tweet video config from ${twitterPostURL}`);
  }
  return result;
}

async function listMedia() {
  const filesList = await fs.promises.readdir(videoDir);
  const videoFilesList = filesList.filter(fileName => {
    return path.parse(fileName).ext === '.mp4';
  });
  let videoFilesWithDatesList = videoFilesList.map(async fileName => {
    const stat = await fs.promises.stat(`${videoDir}/${fileName}`);
    return { fileName, time: stat.birthtimeMs };
  });
  videoFilesWithDatesList = await Promise.all(videoFilesWithDatesList);
  videoFilesWithDatesList.sort((f1, f2) => f2.time - f1.time);
  const orderedMediaIdList = videoFilesWithDatesList.map(f => path.parse(f.fileName).name);
  return { media: orderedMediaIdList };
}

function getMediaPaths(mediaId) {
  return {
    video: `${videoDir}/${mediaId}.mp4`,
    image: `${videoDir}/${mediaId}.jpg`
  };
}

function mediaIdIsValid(mediaId) {
  return mediaId.match(/^[a-z0-9]+$/i);
}

async function deleteMedia(mediaId) {
  if (!mediaIdIsValid(mediaId)) {
    logger.info(`Rejected deletion of media with id=${mediaId}, since it's not a valid id`);
    throw Error(`Id "${mediaId}" is not a valid media ID`);
  }
  const paths = getMediaPaths(mediaId);
  try {
    await Promise.all([fs.promises.unlink(paths.video), fs.promises.unlink(paths.image)]);
  } catch (e) {
    throw Error(`Can't delete media with id="${mediaId}"`);
  }
}

module.exports = {
  downloadMedia,
  listMedia,
  getMediaPaths,
  deleteMedia
};
