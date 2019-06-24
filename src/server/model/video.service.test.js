const fs = require('fs');
const videoService = require('./video.service');

const logger = require('../configs/logger');

jest.mock('dotenv-safe');
jest.mock('fs');
jest.mock('../configs/logger', () => {
  return {
    info: jest.fn(() => 42)
  };
});

fs.promises = {
  unlink: jest.fn()
};

describe('Delete media', () => {
  afterEach(() => {
    logger.info.mockClear();
    fs.promises.unlink.mockReset();
  });

  test('Delete media with invalid ID should throw error', async () => {
    await expect(videoService.deleteMedia('1232142@#$')).rejects.toThrow();
  });

  test('Delete media with invalid ID should log the attempt', async () => {
    try {
      await videoService.deleteMedia('1232142@#$');
    } catch (err) {}
    expect(logger.info).toHaveBeenCalledTimes(1);
  });

  test('Delete media with valid ID should delete mp4 and jpg files via fs.promises.unlink', async () => {
    await expect(videoService.deleteMedia('1232142')).resolves;
    expect(fs.promises.unlink).toHaveBeenCalledTimes(2);
  });

  test('Delete media with valid ID should throw error in case of fs issues', async () => {
    fs.promises.unlink.mockReturnValue(Promise.reject(new Error('Err')));
    await expect(videoService.deleteMedia('1232142')).rejects.toThrow();
  });
});
