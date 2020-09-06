const { getUserFromArgs } = require("../scripts/args");
const { findPlayer, checkLive } = require("../data/database");
const { moveFunc } = require("../scripts/movement");


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
        message.delete({ timeout: 1000 });
        let user = getUserFromArgs([...args]);

        // If statement checks for a mention instead of a user, and switches the mention for the mentioned user
        if (user.startsWith('<@')) {
            let mention = message.mentions.users.first();
            user = mention.username
            console.log(`Mention detected, username now: ${user}`)
        }

        let target = findPlayer(user); // Finds the DB save of the target

        if (target.leader) { 
            message.reply(`Cannot move ${target.player.user.username} because they are the leader.`);
            return;
        }

        moveFunc(message,target);

    }//execute
}