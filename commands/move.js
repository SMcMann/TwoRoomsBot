const { getUserFromArgs } = require("../scripts/args");
const { findPlayer, checkLive, updateVoice } = require("../data/database");
const { roles, channels } = require("../data/serverValues");

function moveFunc (message,target) {
    let roomA, roomB;
    let roleA, roleB;
    if (target.currChannel == channels.room1) {
        roomA = channels.room2;
        roleA = roles.room2;
        roomB = channels.room1;
        roleB = roles.room1;
    } else {
        roomA = channels.room1;
        roleA = roles.room1;
        roomB = channels.room2;
        roleB = roles.room2;
    }
    message.channel.send(`Moving ${target.player.user.username} to ${roomA}`)
        .then(sentMessage => {
            //Update currChannel
            updateVoice(target,roomA);
            //Update role
            target.player.roles.add(target.player.guild.roles.cache.find(r => r.name == roleA));
            target.player.roles.remove(target.player.guild.roles.cache.find(r => r.name == roleB));
            //Move
            target.player.edit({channel: target.player.guild.channels.cache.find(c => c.name == roomA)});
        })
        .catch(console.error);
}

module.exports = {
    name: 'move', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['switch'],
    cooldown: 0,
    description: 'Moves a player from their current room to the opposite',
    args: false, 
    execute(message, args){
        if (message.channel.type === 'dm') return;
        if (!checkLive()) {
            message.reply('No game is active, contact a moderator!');
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

        moveFunc(message,target);

    }//execute
}