'use strict';

const lala = require('@lala.js/core');
const mongodb = require('mongodb');
const config = require('../../config.json');

class DatabaseProvider extends lala.Provider {
    static _getConnectionURI(){
        let uri = 'mongodb://';
        if ( config.database.username !== '' && config.database.password !== '' ){
            uri += config.database.username + ':' + config.database.password + '@';
        }
        return uri + config.database.host + ':' + config.database.port;
    }

    static async setup(){
        const uri = DatabaseProvider._getConnectionURI();
        const client = new mongodb.MongoClient(uri, {
            useUnifiedTopology: true
        });
        await client.connect();
        global.database = await client.db(config.database.database);
    }
}

module.exports = DatabaseProvider;
