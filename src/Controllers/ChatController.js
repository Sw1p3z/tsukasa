'use strict';

const Controller = require('./Controller');
const config = require('../../config.json');

class ChatController extends Controller {
    static _targets = new Map();

    _getChannel(){
        let channel = this._message.channel;    
        const targetChannelID = ChatController._targets.get(this._message.guild.id);
        const channelName = config.features.chat.pilotChannelName.toLowerCase();
        if ( typeof targetChannelID !== 'undefined' && this._message.channel.name.toLowerCase() === channelName ){
            const targetChannel = this._message.guild.channels.resolve(targetChannelID);
            if ( targetChannel !== null ){
                channel = targetChannel;
            }
        }
        return channel;
    }

    async target(){
        let channel = null;
        const messageText = this._message.content.substr(8).trim();
        if ( messageText.indexOf('<#') === 0 && messageText.indexOf('>') === ( messageText.length - 1 ) ){
            const channelID = messageText.substr(2).substring(0, messageText.length - 3);
            if ( channelID !== '' ){
                channel = this._message.guild.channels.resolve(channelID);
                if ( channel !== null ){
                    ChatController._targets.set(this._message.guild.id, channelID);
                    await this._reply('Canale target impostato!');
                }
            }
        }
        if ( channel === null ){
            await this._reply('Non riesco a trovare questo canale...');
        }
    }

    async dropTarget(){
        ChatController._targets.delete(this._message.guild.id);
        await this._reply('Canale target rimosso!');
    }

    async say(){
        const messageText = this._message.content.substr(5);
        const channel = this._getChannel();
        await this._message.delete();
        await this._reply(messageText, channel);
    }

    async type(){
        const messageText = this._message.content.substr(6);
        const channel = this._getChannel();
        await this._message.delete();
        await this._replyWithDelay(messageText, 2000, true, channel);
    }

    async lock(){
        if ( config.sudo.indexOf(this._message.author.id) >= 0 ){
            if ( global.locked === true ){
                global.locked = false;
                await this._reply('Blocco disattivato.');
            }else{
                global.locked = true;
                await this._reply('Blocco attivato.');
            }
        }else{
            await this._reply('Non hai accesso a questa funzionalità!'); 
        }
    }
}

module.exports = ChatController;
