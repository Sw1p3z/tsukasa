'use strict';

const Controller = require('./Controller');

class TTSController extends Controller {
    async tts(){
        const messageText = this._message.content.substr(5);
        const response = await global.tts.synthesize({
            text: messageText,
            accept: 'audio/mp3',
            voice: 'it-IT_FrancescaVoice'
        });
        const voiceChannel = this._message.member.voice.channel;
        const connection = await voiceChannel.join();
        connection.play(response.result);
    }

    async ttsEn(){
        const messageText = this._message.content.substr(8);
        const response = await global.tts.synthesize({
            text: messageText,
            accept: 'audio/mp3',
            voice: 'en-GB_CharlotteV3Voice'
        });
        const voiceChannel = this._message.member.voice.channel;
        const connection = await voiceChannel.join();
        connection.play(response.result);
    }
}

module.exports = TTSController;
