'use strict';

const lala = require('@lala.js/core');
const MemberCountObserver = require('../support/MemberCountObserver');

class MemberCountProvider extends lala.Provider {
    static async setup(){
        await MemberCountObserver.countMembers();
    }
}

module.exports = MemberCountProvider;
