'use strict';

const Controller = require('./Controller');

class ConverterController extends Controller {
    async convertMiles(){
        const miles = parseFloat(this._message.content.substr(15));
        if ( isNaN(miles) ){
            await this._message.channel.send('dati non validi');
            return;
        }
        const kilometers = miles * 1.609344;
        await this._message.channel.send(miles + ' miglia equivalgono a ' + kilometers + ' kilometri ');  
    }
}

module.exports = ConverterController;
