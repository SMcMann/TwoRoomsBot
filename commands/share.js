const { findPlayer, checkCondition, checkLive } = require('../data/database');
const { getUserFromArgs } = require('../scripts/args');
const { shareColor, shareCard } = require('../scripts/shareFuctions');
const dice = require('../scripts/dice');

const cmdError = `**Command Stucture:** \`!exchange card <user>\`\nYou must specify what type of share you want to do.\n - color\n - card`
const cardAliases = ['role', 'all'];
const colorAliases = ['colour', 'team'];

module.exports = {
    name: 'share', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['trade','exchange'],
    cooldown: 0,
    description: 'Share your team or color with another user in your room.',
    args: true, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 500 });
        if (!checkLive()) {
            message.reply('No game is active, contact a moderator!');
            return;
        }
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

        let rejection = (message, user) => {
            message.author.send(`${user} has rejected your offer to exchange ${cmd} information!`)
            console.log(`${user} has been forced to reject the exchange of ${cmd} information with ${message.author.username}!`)
        }

        if (checkCondition(initiator,"shy")) {
            message.author.send("Sorry, you are too shy to share your card. You have the 'shy' condition. Try seeing a Psychologist.");
            return;
        }

        let seconds = dice.d6() + 4
        if (checkCondition(target, 'shy')) {
            target.player.user.send(`${message.author.username} wants exchange ${cmd} information with you... but you are too shy! You will automatically reject the offer in ${seconds} seconds.`)
            setTimeout(rejection, seconds*1000, message, user)
            return;
        }

        if (cmd === 'card' && checkCondition(target, 'coy')) {
            target.player.user.send(`${message.author.username} wants exchange ${cmd} information with you... but you are too coy! You will automatically reject the offer in ${seconds} seconds.`)
            setTimeout(rejection, seconds*1000, message, user)
            return;
        }

        target.player.user.send(`${message.author.username} wants exchange ${cmd} information with you...\n\n Would like to accept?\n✅ Exchange Card Information\n⛔ Reject the Offer`)
        .then(sentMessage => {
            sentMessage.react('✅');
            sentMessage.react('⛔');
            const filter = (reaction, user) => user.id === target.player.id// 
            const collector = sentMessage.createReactionCollector(filter, { time: 600000, max: 1 });
            collector.on('collect', r => {
                if (r.emoji.name === '✅') {
                    if (cmd === 'card') {
                        shareCard(initiator, target, true);
                        shareCard(target, initiator, true);
                    }
                    if (cmd === 'color') {
                        shareColor(initiator, target, true);
                        shareColor(target, initiator, true);
                    }
                    console.log(`${message.author.username} and ${user} have exchanged ${cmd} information`)
                }
                if (r.emoji.name === '⛔') {
                    console.log(`${user} has rejected your offer to exchange ${cmd} information with ${message.author.username}!`)
                    message.author.send(`${user} has rejected your offer to exchange ${cmd} information!`)
                }
            }) // End collector
        }) // End Reaction listner
        .catch(console.error);
        return;
    }//execute
}