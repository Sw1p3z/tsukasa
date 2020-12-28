'use strict';

const UtteranceController = require('./UtteranceController');
const MusicService = require('../../services/MusicService');

class MusicUtteranceController extends UtteranceController {
    async createPlaylist(){
        await this._replyWithDelay('Come si chiama la playlist?', 1500, true);
        const playlistName = await this._prompt();
        await this._replyWithDelay('Vuoi che la playlist sia privata?', 2000, true);
        const response = await this._prompt();
        const isPrivate = response.content.toLowerCase() === 'si';
        const musicService = new MusicService(this._message.channel);
        await musicService.createPlaylist(playlistName.content, this._message.author, isPrivate);
    }
}

module.exports = MusicUtteranceController;
