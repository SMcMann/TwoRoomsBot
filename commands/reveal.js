const { findPlayer, checkLive } = require('../data/database');
const { getUserFromArgs } = require('../scripts/args');
const { shareColor, shareCard } = require('../scripts/shareFuctions');

const cmdError = `**Command Stucture:** \`!share card <user>\`\nYou must specify what type of share you want to do.\n - color\n - card`
const cardAliases = ['role', 'all'];
const colorAliases = ['colour', 'team'];

module.exports = {
    name: 'reveal', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['show', 'send', 'whisper'],
    cooldown: 0,
    description: 'Share your team or color with another user in your room.',
    args: true, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 2000 })
        if (!checkLive()) {
            message.reply('No game is active, contact a moderator to get a game started!');
            return;
        };
        if (args.length < 2) {
            message.author.send(cmdError);
            return;
        }

        let cmd = args[0];
        if (colorAliases.some(el => el === cmd.toLowerCase())) cmd = 'color';
        if (cardAliases.some(el => el === cmd.toLowerCase())) cmd = 'card';

        args.shift(); // Removes the command Arg
        let user = getUserFromArgs(args) // Creates target user variable

        // If statement checks for a mention instead of a user, and switches the mention for the mentioned user
        if (user.startsWith('<@')) {
            let mention = message.mentions.users.first();
            user = mention.username
            console.log(`Mention detected, username now: ${user}`)
        }

        let target = findPlayer(user); // Finds the DB save of the target
        let initiator = findPlayer(message.author.username); // Finds the DB save of current user
        
        // Invalid user check
        if (target !== undefined) {
            console.log(`${user} is a valid target!`);
        } else {
            // Errors out if the user isn't found in the database
            message.author.send(`${user} is not a valid share target!`);
            return;
        }
        
        // Switch statement checks for share type and executes
        switch (cmd) {
            case('color'):
                shareColor(initiator, target, false);
                break;
            case('card'):
                shareCard(initiator, target, false);
                break;
            default:
                message.author.send(cmdError)
        }
        return;
    }//execute
}