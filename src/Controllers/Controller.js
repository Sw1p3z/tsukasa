'use strict';

class Controller {
    _reply(message){
        return this._message.channel.send(message);
    }

    constructor(client, message){
        this._client = client;
        this._message = message;
    }
}

module.exports = Controller;
