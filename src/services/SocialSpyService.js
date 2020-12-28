'use strict';

const filesystem = require('fs');
const Service = require('./Service');

class SocialSpyService extends Service {
    _channel = null;

    constructor(channel){
        super();

        this._channel = channel;
    }

    async dump(){
        let messages = [], beforeID = null, lastBlockSize = 1;
        while ( lastBlockSize > 0 ){
            lastBlockSize = 0;
            const messageBlock = await this._channel.messages.fetch({
                limit: 100,
                before: beforeID
            });
            for ( const [messageID, message] of messageBlock ){
                messages.push({
                    channelID: message.channel.id,
                    authorID: message.author.id,
                    content: message.content,
                    date: new Date(message.createdTimestamp)
                });
                lastBlockSize++;
                beforeID = message.id;
            }
        }
        return messages;
    }

    async dumpToFile(messages = null){
        if ( messages === null ){
            messages = await this.dump();
        }
        const path = __dirname + '/../../drive/archive/' + this._channel.id + '.log';
        const writeStream = filesystem.createWriteStream(path);
        await (new Promise((resolve, reject) => {
            writeStream.once('open', () => {
                for ( let i = 0 ; i < messages.length ; i++ ){
                    const row = '[' + messages[i].authorID + ' - ' + messages[i].date + ']: ' + messages[i].content + '\n';
                    writeStream.write(row);
                }
                writeStream.close();
                resolve();
            });
            writeStream.on('error', (error) => {
                reject(error);
            });
        }));
    }

    async dumpToDatabase(messages = null){
        if ( messages === null ){
            messages = await this.dump();
        }
        await global.database.collection('messages').insertMany(messages);
    }
}

module.exports = SocialSpyService;
