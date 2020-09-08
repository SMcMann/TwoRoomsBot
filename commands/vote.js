//const server = require("../data/server.json");
const { roles, channels } = require("../data/serverValues");
const { findPlayer, checkLive, updateLeadership, updateVoice } = require("../data/database");
const { runSoloVote, runGroupVote, channelVoting, findLeader } = require("../scripts/voting");
const { getUserFromArgs } = require("../scripts/args");

module.exports = {
    name: 'vote', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['nominate','elect'],
    cooldown: 0,
    description: 'Used for a leader abdicating their position or nominating someone to ursurp the current leader.',
    args: true,
    execute(message, args){
        if (message.channel.type === 'dm') return;
        message.delete({ timeout: 500 })
        if (!(message.channel.name === channels.text1 || message.channel.name === channels.text2)) {
            message.reply("sorry! Make sure you are voting in your room's text channel");
            return;
        }
        if (!checkLive()) {
            message.reply('No game is active, there is nobody to vote on. Contact a moderator to get a game going!');
            return;
        }
        let user = getUserFromArgs([...args]);

        // If statement checks for a mention instead of a user, and switches the mention for the mentioned user
        if (user.startsWith('<@')) {
            let mention = message.mentions.users.first();
            user = mention.username
            console.log(`Mention detected, username now: ${user}`)
        }

        let target = findPlayer(user); // Finds the DB save of the target
        let initiator = findPlayer(message.author.username); // Finds the DB save of current user

        //Update voice channels for these two, then update variables
        /*updateVoice(target,target.voice.channel.name);
        updateVoice(initiator,initiator.voice.channel.name);
        target = findPlayer(user);
        initiator = findPlayer(message.author.username);*/

        //Abort if invalid target
        if (!target) {
            message.reply(`${user} is not a vaild vote target.`);
            return;
        }

        //Abort if voting for someone not in the same room
        if (target.currChannel === null || target.currChannel !== initiator.currChannel) {
            message.reply(`Sorry, you cannot vote ${target.player.user.username} as leader. You are not in the same room (Voice Channel).`);
            return;
        }

        //Abort if there is already a vote going on in the room
        if (channelVoting(initiator.currChannel)) {
            message.reply("Sorry, you can't initialize another vote while there is a vote going on.");
            return;
        }

        let curr_leader = findLeader(initiator.currChannel);

        if (!curr_leader) {
            //Initialize first leader
            if (target.player.user.id == initiator.player.user.id) {
                message.reply(`Sorry, you cannot nominate yourself to be the first leader. Try getting someone to nominate you!`);
                return;
            } else {
                message.channel.send(`${initiator.player.user.username} has nominated ${target.player.user.username} as the first leader of this room.\n`+
                    `<@${target.player.user.id}>, do you accept the position?`)
                    .then(console.log(`${initiator.player.user.username} started initial vote in ${initiator.player.currChannel}`))
                    .then(sentMessage => { runSoloVote(sentMessage, target) })
                    .catch(console.error);
            }
        } else if (initiator.leader) {
            //The current leader is abdicating their position
            message.channel.send(`${initiator.player.user.username} is abdicating their position! They are offering it to ${target.player.user.username}.\n`+
                `<@${target.player.user.id}>, do you accept?`)
                .then(console.log(`${initiator.player.user.username} abdicated leadership in ${initiator.currChannel}`))
                .then(sentMessage => { runSoloVote(sentMessage, target, curr_leader) })
                .catch(console.error);
        } else {
            //Nomination for ursupring
            message.channel.send(`${initiator.player.user.username} has nominated ${target.player.user.username} to ursurp the leader.\n`+
                "Cast your vote by reacting to this message.")
                .then(console.log(`${initiator.player.user.username} started vote in ${initiator.currChannel}`))
                .then(sentMessage => { runGroupVote(sentMessage, target, curr_leader) })
                .catch(console.error);
        }
    }//execute
}