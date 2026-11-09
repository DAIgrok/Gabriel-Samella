const fs = require('fs');
const path = require('path');
const https = require('https');

const imgDir = path.join(__dirname, 'public', 'assets', 'img');
const audioDir = path.join(__dirname, 'public', 'assets', 'audio');

fs.mkdirSync(imgDir, { recursive: true });
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
    await download('https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80', path.join(imgDir, 'p1.jpg'));
    await download('https://images.unsplash.com/photo-1518599904199-0ca897819ddb?w=600&q=80', path.join(imgDir, 'p2.jpg'));
    
    for(let i = 1; i <= 38; i++) {
      const src = i % 2 === 0 ? 'p1.jpg' : 'p2.jpg';
      fs.copyFileSync(path.join(imgDir, src), path.join(imgDir, `${i}.jpg`));
    }
    console.log("Images populated!");
  } catch (e) {
    console.error(e);
  }
})();
