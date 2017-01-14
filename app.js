// App consts
const TRANSLATION_SERVICE_URL = 'https://zpi.herokuapp.com/api/translate';
const PORT = process.env.PORT || 8000;

const express = require('express');
const path = require('path');
const Tesseract = require('tesseract.js');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const bodyParser = require('body-parser');
const rp = require('request-promise');
const async = require('async');


// initializing app
const app = express();

// adding middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// defining routes
app.get('/', (req, res) => {
    res.send('To begin go to /start');
});

app.post('/upload', upload.single('photo'), function (req, res, next) {
    console.log(req.file);
    Tesseract.recognize(req.file.path, {lang: 'pol'}).then(bundle => {
        res.send(getWords(bundle));
    });
})

app.post('/translate', (req, apiResponse) => {
    const wordsToTranslate = req.body.words;
    const translationResult = [];
    console.log(wordsToTranslate);

    const promises = wordsToTranslate.map(word => {
        return new Promise((resolve, reject) => {
            sendTranslationRequest(word).then(translationResponse => {
                translationResult.push(translationResponse.translation);
                resolve();
            });
        });
    });
    Promise.all(promises).then(() => apiResponse.send(translationResult));
});

app.get('/start', (req, res) => {
    Tesseract.recognize(path.join(__dirname,'/public/img5.jpg'), {lang: 'pol'}).then(bundle => {
        res.send(getWords(bundle));
    });
});


// starting app...
app.listen(PORT, () => console.log('app is listening on port 8000'));


// helper functions
function getWords (bundle) {
    console.log('get words');
    return bundle.words.map(wordObject => wordObject.text);
}

function convertToText (bundle) {
    return bundle.words.filter(word => word.text != '/n');
}

function sendTranslationRequest (word) {
    var options = {
        method: 'POST',
        uri: TRANSLATION_SERVICE_URL,
        body: {
            from: 'pl',
            to: 'en',
            word: word
        },
        json: true
    };
    return rp(options);
}
