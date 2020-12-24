'use strict';

const Controller = require('./Controller');

class MemberProfileController extends Controller {
    static _registrationSessions = new Map();

    async _handleGenderAnswer(messageText){
        let gender = null;
        messageText = messageText.toLowerCase();
        if ( messageText === 'm' || messageText === 'maschio' || messageText === 'ragazzo' || messageText === 'uomo' ){
            gender = 'M';
        }else if ( messageText === 'f' || messageText === 'femmina' || messageText === 'ragazza' || messageText === 'donna' ){
            gender = 'F';
        }
        if ( gender === null ){
            await this._replyWithDelay('Mi dispiace, non riesco a capire, sei un ragazzo o una ragazza?', 2000, true);
        }else{
            await this._replyWithDelay('Bene, passiamo alla prossima domanda...', 1000, true);
        }
        return gender !== null;
    }

    async _handleRegistrationStep(){
        const sessionID = this._message.guild.id + '@' + this._message.author.id;
        let session = MemberProfileController._registrationSessions.get(sessionID), isValid = true;
        if ( typeof session === 'undefined' ){
            session = {
                step: 1,
                data: {}
            };
            MemberProfileController._registrationSessions.set(sessionID, session);
            await this._reply('Benvenuto, creiamo insieme il tuo profilo personale!');
        }
        switch ( session.step ){
            case 1: {
                await this._replyWithDelay('Sei un ragazzo o una ragazza?', 1000, true);
                const message = await this._prompt(this._message.channel.id, this._message.author.id);
                isValid = await this._handleGenderAnswer(message.content);
            }break;
            case 2: {
                await this._replyWithDelay('Ti piacciono i videogiochi?', 500, true);
                const message = await this._prompt(this._message.channel.id, this._message.author.id);
                if ( message.content.toLowerCase() === 'no' ){
                    session.step++;
                }
            }break;
            case 3: {
                await this._replyWithDelay('Dimmi, a quali giochi preferisci giocare?', 1500, true);
                const message = await this._prompt(this._message.channel.id, this._message.author.id);
            }break;
            default:{
                return;
            };
        }
        if ( isValid ){
            session.step++;
            await this._handleRegistrationStep();
        }
    }

    async register(){
        await this._handleRegistrationStep();
    }
}

module.exports = MemberProfileController;
