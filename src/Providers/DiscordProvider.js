'use strict';

const lala = require('@lala.js/core');
const Discord = require('discord.js');
const config = require('../../config.json');
const Dispatcher = require('../Dispatcher');

class DiscordProvider extends lala.Provider {
    static setup(){
        return new Promise((resolve, reject) => {
            global.client = new Discord.Client();
            global.client.on('ready', () => {
                const dispatcher = new Dispatcher();
                dispatcher.handle(global.client);
                resolve();
            });
            global.client.login(config.token);
        });
    }
}

module.exports = DiscordProvider;
