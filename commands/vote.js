const Discord = require('discord.js');
const server = require("../data/server.json");
const { findPlayer } = require("../data/database");
const { runSoloVote, runGroupVote, channelVoting } = require("../scripts/voting");

module.exports = {
    name: 'vote', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: [],
    cooldown: 0,
    alias: ['elect'],
    description: 'Used for a leader abdicating their position or nominating someone to ursurp the current leader.',
    args: true,
    execute(message, args){
        if (message.channel.type === 'dm') return;
        let user; // Creates target user variable
        let array = [...args]; // Copies the args into an array
        
        // FOR Loop recombines the username back into a string
        for (let el of array) {
            el.trim(); // Removes any whitespace on the element....
            el === array[0] ? user = el : user = `${user} ${el}` // Reconstructs string
        };

        // If statement checks for a mention instead of a user, and switches the mention for the mentioned user
        if (user.startsWith('<@')) {
            let mention = message.mentions.users.first();
            user = mention.username
            console.log(`Mention detected, username now: ${user}`)
        }

        let target = findPlayer(user); // Finds the DB save of the target
        let initiator = findPlayer(message.author.username); // Finds the DB save of current user

        //Abort if invalid target
        if (!target) {
            message.reply(`${user} is not a vaild vote target.`);
            return;
        }

        //Abort if voting for someone not in the same room
        if (target.voice.channel.id != initiator.voice.channel.id) {
            message.reply(`Sorry, you cannot vote ${target.displayName} as leader. You are not in the same room.`);
            return;
        }

        //Abort if there is already a vote going on in the room
        if (channelVoting(initiator.voice.channel)) {
            message.reply("Sorry, you can't initialize another vote while there is a vote going on.");
        }

        let curr_leader = initiator.voice.channel.members.find(p => p.roles.some(r => r.name == server.roles.leader));

        if (!curr_leader) {
            //Initialize first leader
            if (target.user.id == initiator.user.id) {
                message.reply(`Sorry, you cannot nominate yourself to be the first leader. Try getting someone to nominate you!`);
                return;
            } else {
                message.reply(`${initiator.displayName} has nominated ${target.displayName} as the first leader of this room.\n`+
                    `<@!${target.user.id}>, do you accept the position?`)
                    .then(console.log(`${initiator.displayName} started initial vote in ${initiator.voice.channel.name}`))
                    .then(sentMessage => { runSoloVote(sentMessage, target) })
                    .catch(console.error);
            }
        } else if (message.author.roles.cache.some(r => r.name == server.roles.leader)) {
            //The current leader is abdicating their position
            message.reply(`${initiator.displayName} is abdicating their position! They are offering it to ${target.displayName}.\n`+
                `<@!${target.user.id}>, do you accept?`)
                .then(console.log(`${initiator.displayName} abdicated leadership in ${initiator.voice.channel.name}`))
                .then(sentMessage => { runSoloVote(sentMessage, target, curr_leader) })
                .catch(console.error);
        } else {
            //Nomination for ursupring
            let posVotes = 0;
            message.reply(`${author.displayName} has nominated ${target.displayName} for leader.\n`+
                "Cast your vote by reacting to this message.")
                .then(console.log(`${initiator.displayName} started vote in ${initiator.voice.channel.name}`))
                .then(sentMessage => { runGroupVote(sentMessage, target, curr_leader) })
                .catch(console.error);
        }
    }//execute
}