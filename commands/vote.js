const Discord = require('discord.js');
const server = require("../data/server.json");

//Flags to indicate whether a vote is happening in a room
let voting = {
    room1: false,
    room2: false
};

function channelVoting(channel) {
    if (channel.name == server.channels.room1) return voting.room1;
    return voting.room2;
}

function setVoting(channel,set) {
    if (channel.name == server.channels.room1) voting.room1 = set;
    else voting.room2 = set;
}

module.exports = {
    name: 'vote', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    cooldown: 0,
    description: 'Used for a leader abdicating their position or nominating someone to ursurp the current leader.',
    args: true,
    execute(message, args){
        if (message.channel.type === 'dm') return;
        let user; // Creates target user variable
        let array = [...args]; // Copies the args into an array
        array.shift(); // Removes the command Arg
        
        // FOR Loop recombines the username back into a string
        for (let el of array) {
            el.trim(); // Removes any whitespace on the element....
            el === array[0] ? user = el : user = `${user} ${el}` // Reconstructs string
        };

        let target = findPlayer(user); // Finds the DB save of the target
        let player = findPlayer(message.author.username); // Finds the DB save of current user

        //Abort if invalid target
        if (!target) {
            message.reply(`${uesr} is not a vaild vote target.`);
            return;
        }

        //Abort if voting for someone not in the same room
        if (target.voice.channel.id != player.voice.channel.id) {
            message.reply(`Sorry, you cannot vote ${target.displayName} as leader. You are not in the same room.`);
            return;
        }

        //Abort if there is already a vote going on in the room
        if (channelVoting(player.voice.channel)) {
            message.reply("Sorry, you can't initialize another vote while there is a vote going on.");
        }

        const leaderR = message.guild.roles.cache.filter(r => r.name == server.roles.leader)

        let curr_leader = player.voice.channel.members.find(p => p.roles.some(r => r.name == server.roles.leader));

        if (!curr_leader) {
            //Initialize first leader
            if (target == player) {
                message.reply(`Sorry, you cannot nominate yourself to be the first leader. Try getting someone to nominate you!`);
                return;
            } else {
                const filter = (reaction, user) => {
                    return ['👍', '👎'].includes(reaction.emoji.name) && user.id === target.user.id;
                };

                message.reply(`${player.displayName} has nominated ${target.displayName} as the first leader of this room.\n`+
                    `<@!${target.user.id}>, do you accept the position?`)
                    .then(message.react('👍'))
                    .then(message.react('👎'))
                    .then(setChannel(player.voice.channel,true))
                    .then(message.awaitReactions(filter, { max: 1, time: 15, errors: ['time'] }))
                    .then(collected => {
                        const reaction = collected.first();
                
                        if (reaction.emoji.name === '👍') {
                            message.reply(`${target.displayName} accepted! Their role has been updated.`)
                                .then(setChannel(player.voice.channel,false))
                                .then(target.roles.add(leaderR))
                                .catch(console.error);
                        } else {
                            message.reply(`${target.displayName} declined the nomination.`)
                                .then(setChannel(player.voice.channel,false))
                                .catch(console.error);
                        }
                    })
                    .catch(collected => {
                        message.reply('Reaction timer expired.')
                            .then(setChannel(player.voice.channel,false))
                            .catch(console.error); 
                    });
            }
        } else if (message.author.roles.cache.some(r => r.name == server.roles.leader)) {
            //The current leader is abdicating their position
            const filter = (reaction, user) => {
                return ['👍', '👎'].includes(reaction.emoji.name) && user.id === target.user.id;
            };

            message.reply(`${player.displayName} is abdicating their position! They are offering it to ${target.displayName}.\n`+
                `<@!${target.user.id}>, do you accept?`)
                .then(message.react('👍'))
                .then(message.react('👎'))
                .then(setChannel(player.voice.channel,true))
                .then(message.awaitReactions(filter, { max: 1, time: 15, errors: ['time'] }))
                .then(collected => {
                    const reaction = collected.first();
            
                    if (reaction.emoji.name === '👍') {
                        message.reply(`${target.displayName} accepted! Roles have been updated.`)
                            .then(setChannel(player.voice.channel,false))
                            .then(curr_leader.roles.remove(leaderR))
                            .then(target.roles.add(leaderR))
                            .catch(console.error);
                    } else {
                        message.reply(`${target.displayName} declined the nomination.`)
                        .then(setChannel(player.voice.channel,false))
                            .catch(console.error);
                    }
                })
                .catch(collected => {
                    message.reply('Reaction timer expired.')
                        .then(setChannel(player.voice.channel,false))
                        .catch(console.error); 
                });
        } else {
            //Nomination for ursupring
            const filter = (reaction, user) => {
                return ['👍', '👎'].includes(reaction.emoji.name) && user.voice.channel.id === player.voice.channel.id;
            };

            let posVotes = 0;
            message.reply(`${author.displayName} has nominated ${target.displayName} for leader.\n`+
                "Cast your vote by reacting to this message. (vote ends 30 seconds from initialization)")
                .then(message.react('👍'))
                .then(message.react('👎'))
                .then(setChannel(player.voice.channel,true))
                .then(message.awaitReactions(filter, { max: 20, time: 30, errors: ['time'] }))
                .then(collected => {
                    const reaction = collected.first();
            
                    if (reaction.emoji.name === '👍') {
                        posVotes++;
                    }
                })
                .catch(collected => {
                    const roomSize = player.voice.channel.members.size;
                    message.reply('Voting over.');
                    setChannel(player.voice.channel,false);
                    if (posVotes >= roomSize/2) {
                        message.reply(`${target.displayName} has been elected as the new leader of this room! Roles have been updated`)
                            .then(curr_leader.roles.remove(leaderR))
                            .then(target.roles.add(leaderR))
                            .catch(console.error);
                    }
                });
        }
    }//execute
}