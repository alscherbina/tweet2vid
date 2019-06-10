/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const needle = require('needle');
const fs = require('fs');
const parseM3u8 = require('parse-m3u8');
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

async function getGuestToken() {
  const response = await needle(
    'post',
    'https://api.twitter.com/1.1/guest/activate.json',
    {},
    { headers: defaultHeaders }
  );
  return response.body.guest_token;
}

async function getTweetConfig(tweetId) {
  const guestToken = await getGuestToken();
  const tweetConfigURL = `https://api.twitter.com/1.1/videos/tweet/config/${tweetId}.json`;
  const headers = {
    ...defaultHeaders,
    'x-guest-token': guestToken
  };
  const response = await needle('get', tweetConfigURL, {}, { headers });
  return response;
}

function chooseBestQualityPlaylist(playlists) {
  const playlistWithBestQuality = playlists.reduce((result, playlist) => {
    if (!result.attributes || result.attributes.BANDWIDTH < playlist.attributes.BANDWIDTH) {
      return playlist;
    }
    return result;
  }, {});
  return playlistWithBestQuality;
}

async function downloadM3u8Media(uri, filename) {
  const domain = 'https://video.twimg.com';
  let response = await needle('get', uri);
  let m3u8 = parseM3u8(response.body.toString('utf8'));
  const playList = chooseBestQualityPlaylist(m3u8.playlists);
  response = await needle('get', domain + playList.uri);
  m3u8 = parseM3u8(response.body.toString('utf8'));
  for (const segment of m3u8.segments) {
    await pipeline(needle.get(domain + segment.uri), fs.createWriteStream(filename, { flags: 'a' }));
  }
}

async function downloadFile(uri, filename) {
  return pipeline(needle.get(uri), fs.createWriteStream(filename));
}

async function downloadVideo(uri, filename) {
  let videoDownloadPromise = Promise.resolve();
  if (uri.includes('.m3u8')) {
    videoDownloadPromise = downloadM3u8Media(uri, filename);
  } else {
    videoDownloadPromise = downloadFile(uri, filename);
  }
  return videoDownloadPromise;
}

async function downloadMedia(twitterPostURL) {
  const tweetId = twitterPostURL.slice(twitterPostURL.lastIndexOf('/'));
  const result = {
    videoFile: `${videoDir}/${tweetId}.mp4`,
    thumbnailFile: `${videoDir}/${tweetId}.jpg`
  };

  const tweetConfig = await getTweetConfig(tweetId);
  if (tweetConfig && tweetConfig.body && tweetConfig.body.posterImage && tweetConfig.body.track) {
    const posterImageUrl = tweetConfig.body.posterImage;
    const imageDownloadPromise = downloadFile(posterImageUrl, result.thumbnailFile);
    const { playbackUrl } = tweetConfig.body.track;
    const videoDownloadPromise = downloadVideo(playbackUrl, result.videoFile);
    await Promise.all([imageDownloadPromise, videoDownloadPromise]);
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
