const fs = require('fs');
const path = require('path');
const https = require('https');

const audioDir = path.join(__dirname, 'public', 'assets', 'audio');
fs.mkdirSync(audioDir, { recursive: true });

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

(async () => {
  try {
    const sourceMp3 = 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg';
    const tmpFile = path.join(audioDir, 'source.m4a');
    await download(sourceMp3, tmpFile);
    
    fs.copyFileSync(tmpFile, path.join(audioDir, 'videoplayback (1) (1) (1) (1).m4a'));
    fs.copyFileSync(tmpFile, path.join(audioDir, 'videoplayback_3.m4a'));
    fs.copyFileSync(tmpFile, path.join(audioDir, 'videoplayback_4.m4a'));
    fs.copyFileSync(tmpFile, path.join(audioDir, 'videoplayback_5.m4a'));
    fs.copyFileSync(tmpFile, path.join(audioDir, 'videoplayback_6.m4a'));
    
    fs.unlinkSync(tmpFile);
    console.log("Audio populated!");
  } catch (e) {
    console.error(e);
  }
})();
