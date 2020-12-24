'use strict';

const Service = require('./Service');
const ytdl = require('ytdl-core');
const youtubeSearch = require('youtube-search');
const { youTubeAPIKey } = require('../../config.json');

class MusicService extends Service {
    static _queue = new Map();

    static isYoutubeURL(url){
        let isYoutubeURL = false;
        try{
            new URL(url);
            url = url.strtolower();
            isYoutubeURL = url.indexOf('https://youtube') === 0 || url.indexOf('https://www.youtube') === 0;
        }catch{}
        return isYoutubeURL;
    }

    _message = null;
    _channel = null;
    _responseMessage = null;

    _lookupSongOnYoutube(query){
        return new Promise((resolve, reject) => {
            youtubeSearch(query, {
                maxResults: 1,
                key: youTubeAPIKey
            }, (error, results) => {
                if ( error !== null ){
                    return reject(error);
                }
                const url = results.length === 0 ? null : results[0].link;
                resolve(url);
            });
        });
    }

    async _updateStatus(messageText){
        if ( this._responseMessage === null ){
            this._responseMessage = await this._channel.send(messageText);
        }else{
            await this._responseMessage.edit(messageText);
        }
    }

    constructor(channel){
        super();
        this._channel = channel;
    }

    async lookupSongFromMessage(query){
        let songInfo;
        if ( MusicService.isYoutubeURL(query) ){
            songInfo = await ytdl.getInfo(query);
        }else{
            await this._updateStatus('Cerco la canzone su YouTube, un secondo...');
            const youtubeURL = await this._lookupSongOnYoutube(query);
            if ( youtubeURL === null ){
                await this._updateStatus('Mi dispiace, non sono riuscita a trovare questa canzone!');
                return;
            }
            songInfo = await ytdl.getInfo(youtubeURL);
            await this._updateStatus('Ho trovato questa canzone: ' + songInfo.videoDetails.title);
        }
        return {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        };
    }

    async addSongToQueue(song, withFeedback = true){
        let queue = MusicService._queue.get(this._channel.id);
        if ( typeof queue === 'undefined' ){
            queue = {
                list: [],
                connection: null
            };
            MusicService._queue.set(this._channel.id, queue);
        }
        queue.list.push(song);
        if ( withFeedback ){
            await this._updateStatus(song.title + ' è stata aggiunta alla coda.');
        }
    }

    isQueueEmpty(){
        const queue = MusicService._queue.get(this._channel.id);
        return typeof queue === 'undefined' || queue.list.length === 0;
    }

    async getVoiceChannelByMessage(message){
        let available = true;
        const voiceChannel = message.member.voice.channel;
        if ( typeof voiceChannel === 'undefined' ){
            available = false;
            await message.channel.send('Devi entrare in un canale vocale per sentire la musica!');
        }else{
            const permissions = voiceChannel.permissionsFor(message.client.user);
            if ( !permissions.has("CONNECT") || !permissions.has("SPEAK") ){
                available = false;
                await message.channel.send('Ho bisogno dei permessi per entrare e parlare nel tuo canale!');
            }
        }
        return available ? voiceChannel : null;
    }

    async playQueue(voiceChannel){
        if ( this.isQueueEmpty() ){
            await message.channel.send('Non ci sono altri brani in coda.');
            return;
        }
        const queue = MusicService._queue.get(this._channel.id);
        if ( queue.connection === null ){
            queue.connection = await voiceChannel.join();
        }
        queue.currentStream = ytdl(queue.list[0].url);
        const dispatcher = queue.connection.play(queue.currentStream).on('finish', () => {
            queue.list.shift();
            this.playQueue(voiceChannel);
        }).on('error', (error) => console.error(error));
        await this._updateStatus('Sto riproducendo ' + queue.list[0].title);
    }

    async skip(){
        const queue = MusicService._queue.get(this._channel.id);
        if ( typeof queue !== 'undefined' ){
            queue.connection.dispatcher.end();
        }
    }

    async stopPlaying(){
        const queue = MusicService._queue.get(this._channel.id);
        if ( typeof queue !== 'undefined' ){
            queue.list = [];
            queue.connection.dispatcher.end();
        }
    }

    getQueue(){
        return MusicService._queue.has(this._channel.id) ? MusicService._queue.get(this._channel.id).list : [];
    }
}

module.exports = MusicService;
