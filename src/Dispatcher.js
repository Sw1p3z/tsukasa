'use strict';

const config = require('../config.json');

class Dispatcher {
    static _commands = new Map();
    static _utterances = new Map();

    static registerCommand(command, controller, method){
        Dispatcher._commands.set(command, {
            controller: controller,
            method: method
        });
    }

    static registerUtterance(name, controller, method){
        Dispatcher._utterances.set(name, {
            controller: controller,
            method: method
        });
    }

    async handle(client){
        client.on('message', (message) => {
            if ( !message.author.bot ){
                const index = message.content.indexOf(' ');
                const commandName = index > 0 ? message.content.substr(0, index) : message.content;
                const command = Dispatcher._commands.get(commandName);
                if ( typeof command !== 'undefined' ){
                    if ( global.locked === true && config.sudo.indexOf(message.author.id) === -1 ){
                        message.channel.send('Il blocco è stato attivato, nessun comando accettato al momento.');
                    }else{
                        const controller = new command.controller(client, message);
                        controller[command.method]().catch((ex) => {
                            console.log(ex);
                        });
                    }
                }else if ( message.content.toLowerCase().indexOf('hey tsukasa, ') === 0 ){
                    const utteranceName = global.classifier.classify(message.content.substr(13).trim());
                    const utterance = Dispatcher._utterances.get(utteranceName);
                    if ( typeof utterance === 'undefined' ){
                        message.channel.startTyping();
                        setTimeout(() => {
                            message.channel.send('Mi dispiace, non ho capito...');
                            message.channel.stopTyping();
                        }, 1000);
                    }else{
                        const controller = new utterance.controller(client, message);
                        controller[utterance.method]().catch((ex) => {
                            console.log(ex);
                        });
                    }
                }
            }
        });
    }
}

module.exports = Dispatcher;
