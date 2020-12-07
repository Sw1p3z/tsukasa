'use strict';

const ytdl = require('ytdl-core');
const youtubeSearch = require('youtube-search');
const Controller = require('./Controller');
const { youTubeAPIKey } = require('../../config.json');

class MusicController extends Controller {
    static _voiceChannelConnection = null;
    static _queue = new Map();

    static _isYoutubeURL(url){
        let isYoutubeURL = false;
        try{
            new URL(url);
            url = url.strtolower();
            isYoutubeURL = url.indexOf('https://youtube') === 0 || url.indexOf('https://www.youtube') === 0;
        }catch{}
        return isYoutubeURL;
    }

    static _lookupSongOnYoutube(query){
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

    _playSong(guild, song){
        const serverQueue = MusicController._queue.get(guild.id);
        if ( typeof serverQueue === 'undefined' || typeof song === 'undefined' ){
            serverQueue.voiceChannel.leave();
            MusicController._queue.delete(guild.id);
            return;
        }
        const dispatcher = serverQueue.connection.play(ytdl(song.url)).on('finish', () => {
            serverQueue.songs.shift();
            if ( serverQueue.songs.length === 0 ){
                serverQueue.textChannel.send('Non ci sono altri brani in coda, vuoi aggiungerne altri?');
            }else{
                this._playSong(guild, serverQueue.songs[0]);
            }
        }).on('error', (error) => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(`Sto riproducendo: **  ${song.title}**`);
    }

    async play(){
        const query = this._message.content.substr(6);
        let youtubeURL = query;
        if ( !MusicController._isYoutubeURL(query) ){
            youtubeURL = await MusicController._lookupSongOnYoutube(query);
            if ( youtubeURL === null ){
                await this._reply('Mi dispiace, non sono riuscita a trovare questa canzone!');
                return;
            }
        }
        const voiceChannel = this._message.member.voice.channel;
        if ( typeof voiceChannel === 'undefined' ){
            await this._reply('Devi entrare in un canale vocale per sentire la musica!');
            return;
        }
        const permissions = voiceChannel.permissionsFor(this._message.client.user);
        if ( !permissions.has("CONNECT") || !permissions.has("SPEAK") ){
            await this._reply('Ho bisogno dei permessi per entrare e parlare nel tuo canale!');
            return;
        }
        const songInfo = await ytdl.getInfo(youtubeURL);
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        };
        let serverQueue = MusicController._queue.get(this._message.guild.id);
        if ( typeof serverQueue === 'undefined' ){
            serverQueue = {
                textChannel: this._message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };
            serverQueue.connection = await voiceChannel.join();
            MusicController._queue.set(this._message.guild.id, serverQueue);
        }
        serverQueue.songs.push(song);
        if ( serverQueue.songs.length === 1 ){
            this._playSong(this._message.guild, serverQueue.songs[0]);
        }else{
            this._message.channel.send(`${song.title} è stata aggiunta alla coda!`);
        }
    }

    async skip() {
        if ( !this._message.member.voice.channel ){
            await this._reply('Devi stare in un canale per fermare la musica!');
            return;
        }
        const serverQueue = MusicController._queue.get(this._message.guild.id);
        if ( typeof serverQueue === 'undefined' ){
            await this._reply('Non sono riuscita a saltare una canzone!');
            return;
        }
        serverQueue.connection.dispatcher.end();
    }

    async stop() {
        if ( !this._message.member.voice.channel ){
            await this._reply('Devi stare in un canale per fermare la musica!');
            return;
        }
        const serverQueue = MusicController._queue.get(this._message.guild.id);
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }
}

module.exports = MusicController;