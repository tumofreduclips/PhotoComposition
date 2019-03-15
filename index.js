const express = require('express');
const app = express();
const fs = require('fs');

const port = process.env.PORT || 3000;

fs.writeFileSync('public/js/images.js', `const imageList = ${JSON.stringify(fs.readdirSync('public/images/characters'))};\nconst backgroundList = ${JSON.stringify(fs.readdirSync('public/images/backgrounds'))}`);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

app.listen(port, () => {
    console.log(`[STB] Running on port ${port}`);
});