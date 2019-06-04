const needle = require("needle");
const fs = require("fs");
require("dotenv-safe").config();
const videoDir = process.env.VIDEO_DIR;

if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir);
}

async function getGuestToken() {
  const headers = {
    authorization: `Bearer ${process.env.BEARER_TOKEN}`
  };

  const response = await needle("post", "https://api.twitter.com/1.1/guest/activate.json", {}, { headers });
  return response.body.guest_token;
}

async function downloadVideo(postURL = "https://twitter.com/pullover_/status/1135832570669797376") {
  const guestToken = await getGuestToken();
  const tweetId = postURL.slice(postURL.lastIndexOf("/"));
  const tweetConfigURL = `https://api.twitter.com/1.1/videos/tweet/config/${tweetId}.json`;
  const headers = {
    authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    "x-guest-token": guestToken
  };
  const response = await needle("get", tweetConfigURL, {}, { headers });

  console.log(response.body.track.playbackUrl);
  console.log(response.body.posterImage);
  needle.get(response.body.posterImage).pipe(fs.createWriteStream(`${videoDir}/${tweetId}.jpg`));
  needle.get(response.body.track.playbackUrl).pipe(fs.createWriteStream(`${videoDir}/${tweetId}.mp4`));
}

downloadVideo(process.argv[2]);
