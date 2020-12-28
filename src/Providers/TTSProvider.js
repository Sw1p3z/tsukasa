'use strict';

const lala = require('@lala.js/core');
const config = require('../../config.json');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

class TTSProvider extends lala.Provider {
    static async setup(){
        global.tts = new TextToSpeechV1({
            authenticator: new IamAuthenticator({
                apikey: config.features.tts.token,
            }),
            serviceUrl: config.features.tts.url
        });
    }
}

module.exports = TTSProvider;
