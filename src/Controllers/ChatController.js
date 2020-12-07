'use strict';

const Controller = require('./Controller');

class ChatController extends Controller {
    async say(){
        const say = this._message.content.substr(5);
        this._message.channel.send(say);
        this._message.delete();
    }
}

module.exports = ChatController;
