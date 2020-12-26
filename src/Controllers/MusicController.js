'use strict';

const Controller = require('./Controller');
const MusicService = require('../services/MusicService');

class MusicController extends Controller {
    async play(){
        const messageText = this._message.content.substr(6);
        const musicService = new MusicService(this._message.channel);
        const song = await musicService.lookupSongFromMessage(messageText);
        const isQueueEmpty = musicService.isQueueEmpty();
        await musicService.addSongToQueue(song, !isQueueEmpty);
        if ( isQueueEmpty ){
            const voiceChannel = await musicService.getVoiceChannelByMessage(this._message);
            musicService.playQueue(voiceChannel);
        }
    }

    async loop(){
        const musicService = new MusicService(this._message.channel);
        const song = musicService.getSongBeingPlayed();
        if ( song !== null ){
            if ( song.loop === true ){
                song.loop = false;
                await this._reply('Modalità loop disattivata per il brano ' + song.title);
            }else{
                song.loop = true;
                await this._reply('Modalità loop attivata per il brano ' + song.title);
            }
        }else{
            await this._reply('Nessun brano in riproduzione al momento.');
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

    async createPlaylist(){
        const messageText = this._message.content.substr(17);
        const musicService = new MusicService(this._message.channel);
        const components = messageText.split(' ');
        const playlistName = components.length > 0 ? components[0] : null;
        const isPrivate = components.length > 1 && components[1].toLowerCase() === 'private';
        await musicService.createPlaylist(playlistName, this._message.author, isPrivate);
    }

    async addToPlaylist(){
        const playlistName = this._message.content.substr(17);
    }

    async join(){
        const musicService = new MusicService(this._message.channel);
        const voiceChannel = await musicService.getVoiceChannelByMessage(this._message);
        if ( voiceChannel !== null ){
            await voiceChannel.join();
            await this._reply('Sono subito da te!');
        }
    }
}

module.exports = MusicController;
