'use strict';

const lala = require('@lala.js/core');
const natural = require('natural');
const Dispatcher = require('../Dispatcher');
const Controllers = require('../Controllers');

class UtteranceProvider extends lala.Provider {
    static async setup(){
        global.classifier = new natural.BayesClassifier();
        global.classifier.addDocument('come stai?', 'status');
        global.classifier.addDocument('come va?', 'status');
        global.classifier.addDocument('come ti senti?', 'status');
        // Music
        global.classifier.addDocument('crea una nuova playlist', 'createPlaylist');
        global.classifier.addDocument('crea una playlist', 'createPlaylist');
        Dispatcher.registerUtterance('createPlaylist', Controllers.utterances.MusicUtteranceController, 'createPlaylist');
        global.classifier.train();
    }
}

module.exports = UtteranceProvider;
