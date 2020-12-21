'use strict';

const Discord = require('discord.js');
const config = require('./config.json');
const Dispatcher = require('./src/Dispatcher');
const Controllers = require('./src/Controllers');

Dispatcher.registerCommand('?say', Controllers.ChatController, 'say');
Dispatcher.registerCommand('?play', Controllers.MusicController, 'play');
Dispatcher.registerCommand('?skip', Controllers.MusicController, 'skip');
Dispatcher.registerCommand('?stop', Controllers.MusicController, 'stop');
Dispatcher.registerCommand('?convert miles', Controllers.ConverterController, 'convertMiles');

const client = new Discord.Client();
client.on('ready', () => {
    const dispatcher = new Dispatcher();
    dispatcher.handle(client);
    console.log('Sono pronta!');
});
client.login(config.token);
