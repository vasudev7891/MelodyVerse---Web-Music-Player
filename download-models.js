const fs = require('fs');
const https = require('https');
const path = require('path');

const modelsDir = path.join(__dirname, 'client', 'public', 'models');

if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const files = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1'
];

const downloadFile = (fileName) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(modelsDir, fileName);
        const file = fs.createWriteStream(filePath);
        
        https.get(baseUrl + fileName, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${fileName}. Status: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${fileName}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {}); // Delete the file async.
            reject(err);
        });
    });
};

const downloadAll = async () => {
    for (const file of files) {
        await downloadFile(file);
    }
    console.log('All models downloaded successfully!');
};

downloadAll().catch(err => console.error(err));
