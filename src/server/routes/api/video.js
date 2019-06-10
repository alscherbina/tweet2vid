const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('GET /videos');
});

router.post('/task', (req, res) => {
  res.send('POST /videos/task');
});

module.exports = router;