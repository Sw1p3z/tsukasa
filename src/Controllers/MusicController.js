'use strict';

const Controller = require('./Controller');
const MusicService = require('../services/MusicService');

class MusicController extends Controller {
    async play(){
        const query = this._message.content.substr(6);
        const musicService = new MusicService(this._message.channel);
        const song = await musicService.lookupSongFromMessage(query);
        const isQueueEmpty = musicService.isQueueEmpty();
        await musicService.addSongToQueue(song, !isQueueEmpty);
        if ( isQueueEmpty ){
            const voiceChannel = await musicService.getVoiceChannelByMessage(this._message);
            musicService.playQueue(voiceChannel);
        }
    }

    async skip() {
        const musicService = new MusicService(this._message.channel);
        await musicService.skip();
    }

    async stop() {
        const musicService = new MusicService(this._message.channel);
        await musicService.stopPlaying();
    }

    async queue(){
        const musicService = new MusicService(this._message.channel);
        const queue = musicService.getQueue();
        if ( queue.length === 0 ){
            await this._reply('Non ci sono brani nella coda.');
        }else{
            let messageText = '';
            queue.forEach((song, index) => {
                messageText += ( index === 0 ? ( 'In riproduzione: ***' + song.title + '***' ) : ( '- ***' + song.title + '***' ) ) + '\n';
            });
            await this._reply(messageText);
        }
    }
}

module.exports = MusicController;
