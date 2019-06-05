const needle = require('needle');
const fs = require('fs');
const parseM3u8 = require('parse-m3u8');
const stream = require('stream');
const util = require('util');

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

async function downloadM3u8(tweetId, uri) {
  const fileName = `${videoDir}/${tweetId}.m3u8`;

  const response = await needle('get', uri);
  const m3u8 = parseM3u8(response.body.toString('utf8'));
  console.log(m3u8);
}

async function downloadMp4(tweetId, uri) {
  needle.get(uri).pipe(fs.createWriteStream(`${videoDir}/${tweetId}.mp4`));
}

async function downloadVideo(postURL = 'https://twitter.com/pullover_/status/1135832570669797376') {
  const tweetId = postURL.slice(postURL.lastIndexOf('/'));
  const result = {
    videoFile: `${videoDir}/${tweetId}.mp4`,
    thumbnailFile: `${videoDir}/${tweetId}.jpg`
  };
  const tweetConfig = await getTweetConfig(tweetId);
  const posterImageUrl = tweetConfig.body.posterImage;
  const { playbackUrl } = tweetConfig.body.track;
  result.thumbnailFile = `${videoDir}/${tweetId}.jpg`;

  const imageDownloadPromise = pipeline(needle.get(posterImageUrl), fs.createWriteStream(result.thumbnailFile));
  let videoDownloadPromise = Promise.resolve();
  if (playbackUrl.includes('.m3u8')) {
    videoDownloadPromise = downloadM3u8(tweetId, playbackUrl);
  } else {
    videoDownloadPromise = downloadMp4(playbackUrl);
  }
  await Promise.all([imageDownloadPromise, videoDownloadPromise]);
  return result;
}

(async () => {
  const res = await downloadVideo(process.argv[2]);
  console.log(res);
})().catch(error => console.error(error));
