'use strict';

const lala = require('@lala.js/core');
const Dispatcher = require('../Dispatcher');
const Controllers = require('../Controllers');

class MusicProvider extends lala.Provider {
    static async setup(){
        // Music
        Dispatcher.registerCommand('?play', Controllers.MusicController, 'play');
        Dispatcher.registerCommand('?skip', Controllers.MusicController, 'skip');
        Dispatcher.registerCommand('?stop', Controllers.MusicController, 'stop');
        Dispatcher.registerCommand('?queue', Controllers.MusicController, 'queue');
        // Chat
        Dispatcher.registerCommand('?say', Controllers.ChatController, 'say');
        Dispatcher.registerCommand('?type', Controllers.ChatController, 'type');
        Dispatcher.registerCommand('?target', Controllers.ChatController, 'target');
        Dispatcher.registerCommand('?drop-target', Controllers.ChatController, 'dropTarget');
        // Mishelaneous
        Dispatcher.registerCommand('?convert-miles', Controllers.ConverterController, 'convertMiles');
        Dispatcher.registerCommand('?register', Controllers.MemberProfileController, 'register');
    }
}

module.exports = MusicProvider;
