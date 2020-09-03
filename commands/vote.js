//const server = require("../data/server.json");
const { roles } = require("../data/serverValues");
const { findPlayer } = require("../data/database");
const { runSoloVote, runGroupVote, channelVoting } = require("../scripts/voting");
const { getUserFromArgs } = require("../scripts/args");

module.exports = {
    name: 'vote', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['nominate'],
    cooldown: 0,
    alias: ['elect'],
    description: 'Used for a leader abdicating their position or nominating someone to ursurp the current leader.',
    args: true,
    execute(message, args){
        if (message.channel.type === 'dm') return;
        let user = getUserFromArgs([...args]);

        // If statement checks for a mention instead of a user, and switches the mention for the mentioned user
        if (user.startsWith('<@')) {
            let mention = message.mentions.users.first();
            user = mention.username
            console.log(`Mention detected, username now: ${user}`)
        }

        let target = findPlayer(user).player; // Finds the DB save of the target
        let initiator = findPlayer(message.author.username).player; // Finds the DB save of current user

        //Abort if invalid target
        if (!target) {
            message.reply(`${user} is not a vaild vote target.`);
            return;
        }

        //Abort if voting for someone not in the same room
        if (target.voice.channel.id != initiator.voice.channel.id) {
            message.reply(`Sorry, you cannot vote ${target.user.username} as leader. You are not in the same room.`);
            return;
        }

        //Abort if there is already a vote going on in the room
        if (channelVoting(initiator.voice.channel)) {
            message.reply("Sorry, you can't initialize another vote while there is a vote going on.");
            return;
        }

        let curr_leader = initiator.voice.channel.members.find(p => p.roles.cache.some(r => r.name == roles.leader));

        if (!curr_leader) {
            //Initialize first leader
            if (target.user.id == initiator.user.id) {
                message.reply(`Sorry, you cannot nominate yourself to be the first leader. Try getting someone to nominate you!`);
                return;
            } else {
                message.channel.send(`${initiator.user.username} has nominated ${target.user.username} as the first leader of this room.\n`+
                    `<@!${target.user.id}>, do you accept the position?`)
                    .then(console.log(`${initiator.user.username} started initial vote in ${initiator.voice.channel.name}`))
                    .then(sentMessage => { runSoloVote(sentMessage, target) })
                    .catch(console.error);
            }
        } else if (initiator.roles.cache.some(r => r.name == roles.leader)) {
            //The current leader is abdicating their position
            message.channel.send(`${initiator.user.username} is abdicating their position! They are offering it to ${target.user.username}.\n`+
                `<@!${target.user.id}>, do you accept?`)
                .then(console.log(`${initiator.user.username} abdicated leadership in ${initiator.voice.channel.name}`))
                .then(sentMessage => { runSoloVote(sentMessage, target, curr_leader) })
                .catch(console.error);
        } else {
            //Nomination for ursupring
            let posVotes = 0;
            message.channel.send(`${initiator.user.username} has nominated ${target.user.username} to ursurp the leader.\n`+
                "Cast your vote by reacting to this message.")
                .then(console.log(`${initiator.user.username} started vote in ${initiator.voice.channel.name}`))
                .then(sentMessage => { runGroupVote(sentMessage, target, curr_leader) })
                .catch(console.error);
        }
    }//execute
}