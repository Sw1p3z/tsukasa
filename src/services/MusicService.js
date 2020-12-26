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
            url: songInfo.videoDetails.video_url,
            loop: false
        };
    }

    async addSongToQueue(song, withFeedback = true){
        let queue = MusicService._queue.get(this._channel.id);
        if ( typeof queue === 'undefined' ){
            queue = {
                list: [],
                connection: null,
                currentStream: null
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
            await message.channel.send('Devi entrare in un canale vocale prima!');
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
            await this._channel.send('Non ci sono altri brani in coda.');
            return;
        }
        const queue = MusicService._queue.get(this._channel.id);
        if ( queue.connection === null ){
            queue.connection = await voiceChannel.join();
        }
        queue.currentStream = ytdl(queue.list[0].url);
        queue.connection.play(queue.currentStream).on('finish', () => {
            if ( typeof queue === 'object' && queue.list.length >= 1 && queue.list[0].loop !== true ){
                queue.list.shift();
            }
            queue.currentStream = null;
            this.playQueue(voiceChannel);
        }).on('error', (error) => console.error(error));
        await this._updateStatus('Sto riproducendo ' + queue.list[0].title);
    }

    getSongBeingPlayed(){
        const queue = MusicService._queue.get(this._channel.id);
        return typeof queue === 'undefined' || queue.list.length === 0 || queue.currentStream === null ? null : queue.list[0];
    }

    async skip(){
        const queue = MusicService._queue.get(this._channel.id);
        if ( typeof queue !== 'undefined' && queue.connection.dispatcher !== null ){
            queue.connection.dispatcher.end();
        }
    }

    async stopPlaying(){
        const queue = MusicService._queue.get(this._channel.id);
        if ( typeof queue !== 'undefined' ){
            queue.list = [];
            if ( queue.connection.dispatcher !== null ){
                queue.connection.dispatcher.end();
            }
        }
    }

    getQueue(){
        return MusicService._queue.has(this._channel.id) ? MusicService._queue.get(this._channel.id).list : [];
    }

    async playlistExists(name, user, isPrivate){
        const query = {
            channelID: this._channel.guild.id,
            isPrivate: ( isPrivate === true ),
            name: name
        };
        let result;
        if ( query.isPrivate === true ){
            query.userID = user.id;
            result = await global.database.collection('playlists').findOne(query);
        }else{
            result = await global.database.collection('playlists').findOne(query);
        }
        return result !== null;
    }

    async createPlaylist(name, user, isPrivate){
        if ( name === '' || name === null ){
            await this._channel.send('Devi dirmi come si chiama la playlist e il nome non deve contenere spazi.');
            return;
        }
        const exists = Promise.all([this.playlistExists(name, user, false), this.playlistExists(name, user, true)]);
        if ( exists[0] || exists[1] ){
            await this._channel.send('Una playlist con lo stesso nome esiste gia!');
            return;
        }
        await global.database.collection('playlists').insertOne({
            channelID: this._channel.guild.id,
            userID: user.id,
            isPrivate: ( isPrivate === true ),
            name: name,
            entries: []
        });
        this._channel.send('Playlist creata!');
    }

    async addSongToPlaylist(song, playlistName, user){
        const collection = global.database.collection('playlists');
        let playlist = await collection.findOne({
            channelID: this._channel.id,
            userID: user.id,
            name: playlistName,
        });
        console.log(playlist);
    }
}

module.exports = MusicService;
