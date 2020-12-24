'use strict';

const lala = require('@lala.js/core');
const config = require('../../config.json');

class ChatProvider extends lala.Provider {
    static async _ensureChannel(guild){
        let pilotChannelFound = false;
        const channelName = config.features.chat.pilotChannelName.toLowerCase();
        for ( const [channelID, channel] of guild.channels.cache ){
            if ( channel.name.toLowerCase() === channelName ){
                pilotChannelFound = true;
                break;
            }
        }
        if ( !pilotChannelFound ){
            await guild.channels.create(channelName, {
                type: 'text'
            });
        }
    }

    static async setup(){
        if ( global.client.guilds.cache instanceof Map ){
            const processes = [];
            for ( const [guildID, guild] of global.client.guilds.cache ){
                processes.push(ChatProvider._ensureChannel(guild));
            }
            await Promise.all(processes);
        }
    }
}

module.exports = ChatProvider;
