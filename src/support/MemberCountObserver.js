'use strict';

const config = require('../../config.json');

class MemberCountObserver {
    static _counters = new Map();

    static _incrementGuildCounter(guild, increment){
        let components = MemberCountObserver._counters.get(guild.id);
        if ( typeof components !== 'undefined' ){
            components.counter += increment;
            const channel = guild.channels.resolve(components.channelID);
            if ( channel !== null ){
                channel.setName(config.features.memberCount.channelName + ': ' + guild.memberCount);
            }
        }
    }

    static async countMembers(){
        MemberCountObserver._counters.clear();
        const processes = [];
        if ( global.client.guilds.cache instanceof Map ){
            for ( const [guildID, guild] of global.client.guilds.cache ){
                processes.push(MemberCountObserver.addObservedGuild(guild));
            }
        }
        await Promise.all(processes);
        MemberCountObserver.installObserver();
    }

    static async addObservedGuild(guild){
        MemberCountObserver._counters.set(guild.id, {
            counter: guild.memberCount,
            channelID: await MemberCountObserver.getPresentationChannel(guild)
        });
    }

    static async getPresentationChannel(guild){
        let counterChannelID = null;
        const channelPrefix = config.features.memberCount.channelName + ': ';
        for ( const [channelID, channel] of guild.channels.cache ){
            if ( channel.name.indexOf(channelPrefix) === 0 ){
                counterChannelID = channelID;
                await channel.setName(channelPrefix + guild.memberCount);
                break;
            }
        }
        if ( counterChannelID === null ){
            const channel = await guild.channels.create(channelPrefix + guild.memberCount, {
                type: 'voice',
                userLimit: 0,
                position: 0
            });
            counterChannelID = channel.id;
        }
        return counterChannelID;
    }

    static installObserver(){
        global.client.on('guildMemberAdd', (member) => {
            MemberCountObserver._incrementGuildCounter(member.guild, 1);
        });
        global.client.on('guildMemberRemove', (member) => {
            MemberCountObserver._incrementGuildCounter(member.guild, -1);
        });
    }
}

module.exports = MemberCountObserver;
