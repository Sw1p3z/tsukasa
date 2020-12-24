'use strict';

class Controller {
    _reply(message, channel = null){
        if ( channel === null ){
            channel = this._message.channel;
        }
        return channel.send(message);
    }

    _replyWithDelay(message, delay, isTyping = false, channel = null){
        return new Promise((resolve, reject) => {
            if ( channel === null ){
                channel = this._message.channel;
            }
            if ( isTyping === true ){
                channel.startTyping();
            }
            setTimeout(() => {
                channel.send(message).then((message) => {
                    if ( isTyping === true ){
                        channel.stopTyping();
                    }
                    resolve(message);
                }).catch((ex) => {
                    if ( isTyping === true ){
                        channel.stopTyping();
                    }
                    reject(ex);
                });
            }, delay);
        });
    }

    _prompt(channelID, authorID){
        return new Promise((resolve, reject) => {
            const handler = (message) => {
                if ( message.channel.id === channelID && message.author.id === authorID ){
                    global.client.off('message', handler);
                    resolve(message);
                }
            };
            global.client.on('message', handler);
        });
    }

    constructor(client, message){
        this._client = client;
        this._message = message;
    }
}

module.exports = Controller;
