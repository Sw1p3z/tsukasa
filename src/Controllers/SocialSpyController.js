'use strict';

const Controller = require('./Controller');
const SocialSpyService = require('../services/SocialSpyService');

class SocialSpyController extends Controller {
    async dump(){
        const socialSpyService = new SocialSpyService(this._message.channel);
        console.log('Dumping channel ' + this._message.channel.id + '...');
        const messages = await socialSpyService.dump();
        console.log('Saving messaged for channel ' + this._message.channel.id + '...');
        await Promise.all([socialSpyService.dumpToFile(messages), socialSpyService.dumpToDatabase(messages)]);
        console.log('Channel ' + this._message.channel.id + ' dumped!');
    }
}

module.exports = SocialSpyController;
