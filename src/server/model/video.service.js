/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const needle = require('needle');
const fs = require('fs');
const stream = require('stream');
const util = require('util');
const path = require('path');

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
  const tweetId = twitterPostURL.slice(twitterPostURL.lastIndexOf('/') + 1);
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
  const mediaFilesList = await fs.promises.readdir(videoDir);
  // Assuming each media is represented by 2 files with same name and different extensions (jpg, mp4)
  const mediaIdList = mediaFilesList.reduce((res, fileName) => {
    return res.add(path.parse(fileName).name);
  }, new Set());
  return { media: [...mediaIdList] };
}

function getVideoFilePath(mediaId) {
  return `${videoDir}/${mediaId}.mp4`;
}

module.exports = {
  downloadMedia,
  listMedia,
  getVideoFilePath
};
