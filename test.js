const needle = require('needle');
const fs = require('fs');
const parseM3u8 = require('parse-m3u8');
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

async function downloadVideo(postURL = 'https://twitter.com/pullover_/status/1135832570669797376') {
  const guestToken = await getGuestToken();
  const tweetId = postURL.slice(postURL.lastIndexOf('/'));
  const tweetConfigURL = `https://api.twitter.com/1.1/videos/tweet/config/${tweetId}.json`;
  const headers = {
    ...defaultHeaders,
    'x-guest-token': guestToken
  };
  const response = await needle('get', tweetConfigURL, {}, { headers });

  console.log(response.body.track.playbackUrl);
  console.log(response.body.posterImage);
  needle.get(response.body.posterImage).pipe(fs.createWriteStream(`${videoDir}/${tweetId}.jpg`));
  if (response.body.track.playbackUrl.includes('.m3u8')) {
    const fileName = `${videoDir}/${tweetId}.m3u8`;
    const w = needle.get(response.body.track.playbackUrl).pipe(fs.createWriteStream(fileName));
    w.on('finish', () => {
      const contents = fs.readFileSync(fileName, 'utf8');
      console.log(parseM3u8(contents));
    });
  } else {
    needle.get(response.body.track.playbackUrl).pipe(fs.createWriteStream(`${videoDir}/${tweetId}.mp4`));
  }
}

downloadVideo(process.argv[2]);
