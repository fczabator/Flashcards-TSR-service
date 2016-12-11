let express = require('express');
let path = require('path');
let Tesseract = require('tesseract.js');


let app = express();

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.send('To begin go to /start');
});

app.get('/start', (req, res) => {
    Tesseract.recognize(path.join(__dirname,'/public/img5.jpg'), {lang: 'pol'}).then(function(bundle) {
        // console.log(getWords(bundle));
        res.send(getWords(bundle));
    });
});

app.listen(8000, () => console.log('app is listening on port 8000'));

function getWords (bundle) {
    return bundle.words.map(wordObject => wordObject.text);
}

function convertToText (bundle) {
    return bundle.words.filter(word => word.text != '/n');
}