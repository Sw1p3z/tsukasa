'use strict';

const lala = require('@lala.js/core');
const providers = require('./src/Providers');

lala.init({
    providers: Object.values(providers)
}).then(() => {
    console.log('Sono pronta!');
});
