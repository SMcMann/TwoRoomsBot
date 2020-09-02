const Discord = require('discord.js');
const assignments = require("../data/database");
const { editDB, findPlayer } = require('../data/database');

module.exports = {
    name: 'share', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['look', 'send', 'whisper'],
    cooldown: 0,
    description: 'Share your team or color with another user in your room.',
    args: true, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 2000 })
        if (args.length < 2) {
            message.author.send(`**Command Stucture:** \`!share card <user>\`\nYou must specify what type of share you want to do.\n - color\n - card`);
            return;
        }
        let user; // Creates target user variable
        let array = [...args]; // Copies the args into a new array to be edited
        array.shift(); // Removes the command Arg
        
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
        
        // Invalid user check
        if (target !== undefined) {
            console.log(`${user} is a valid target!`);
        } else {
            // Errors out if the user isn't found in the database
            message.author.send(`${user} is not a valid share target!`);
            return;
        }

        // Switch statement checks for share type and executes
        let cmd = args[0];
        if (cmd === 'colour') cmd = 'color';
        if (cmd === 'role') cmd = 'card';

        // Block users with SHY boolean TRUE
        if (initiator.character.shy) {
            initiator.player.user.send("Sorry, you can't share. You have the 'Shy' condition. Try seeing a Psychologist.");
            return;
        }
        
        switch (cmd) {
            case('color'):
                target.player.user.send(`${message.author.username}'s has shared their color with you!\n **Color:** ${initiator.character.color}!\n\n if you would like to recepricate?\n📇 Share Card\n 🖌️ Share Color`)
                    .then(console.log(`${message.author.username} shared their color with ${user}`))
                    .then(message.author.send(`Your color was successfully shared with ${target.player.user.username}`))
                    .then(sentMessage => {
                        sentMessage.react('📇');
                        sentMessage.react('🖌️');
                        const filter = (reaction, user) => user.id === target.player.id// 
                        const collector = sentMessage.createReactionCollector(filter, { time: 600000, max: 2 });
                        collector.on('collect', r => {
                            if (r.emoji.name === '🖌️') {
                                console.log(`${target.player.user.username} has shared color back...`);
                                initiator.player.user.send(`${target.player.user.username} has shared their color with you!\n **Color:** ${target.character.color}!`)
                                    .then(target.player.user.send(`You shared color with ${message.author.username}!`))
                                    .catch(console.error);
                            }
                            if (r.emoji.name === '📇') {
                                console.log(`${target.player.user.username} has shared card back...`);
                                initiator.player.user.send(`${target.player.user.username} has shared their card with you!\n**Role:** ${target.character.name}!\n **Color:** ${target.character.color}!`)
                                    .then(target.player.user.send(`You shared card with ${message.author.username}!`))
                                    .catch(console.error);
                            }
                        }) // End collector
                    }) // End Reaction listner
                    .catch(console.error);
                // TO-DO change any flags in the DB that needs to change due to COLOR share...    
                break;
            case('card'):
                if (initiator.character.coy) {
                    initiator.player.user.send("Sorry, you can't card share. You have the 'Coy' condition. Try seeing a Psychologist.");
                    return;
                }
                target.player.user.send(`${message.author.username} has shared their card with you!\n**Role:** ${initiator.character.name}!\n **Color:** ${initiator.character.color}!\n\n if you would like to recepricate?\n📇 Share Card\n 🖌️ Share Color`)
                    .then(sentMessage => {
                        sentMessage.react('📇');
                        sentMessage.react('🖌️');
                        const filter = (reaction, user) => user.id === target.player.id;
                        const collector = sentMessage.createReactionCollector(filter, { time: 600000, max: 2 });
                        collector.on('collect', r => {
                            if (r.emoji.name === '🖌️') {
                                console.log(`${target.player.user.username} has shared color back...`);
                                initiator.player.user.send(`${target.player.user.username} has shared their color with you!\n **Color:** ${target.character.color}!`)
                                    .then(target.player.user.send(`You shared color with ${message.author.username}!`))
                                    .catch(console.error);
                            }
                            if (r.emoji.name === '📇') {
                                console.log(`${target.player.user.username} has shared card back...`);
                                initiator.player.user.send(`${target.player.user.username} has shared their card with you!\n**Role:** ${target.character.name}!\n **Color:** ${target.character.color}!`)
                                    .then(target.player.user.send(`You shared card with ${message.author.username}!`))
                                    .catch(console.error);
                            }
                        }) // End collector
                    }) // End Reaction listner
                    .then(console.log(`${message.author.username} shared their card with ${user}`))
                    .then(message.author.send(`Your card was successfully shared with ${target.player.user.username}`))
                    .catch(console.error); // End send
                // TO-DO change any flags in the DB that needs to change due to CARD share...
                if (initiator.character.name == "Red Psychologist" || initiator.character.name == "Blue Psychologist") {
                    console.log("Attempting to remove conditions");
                    editDB(target.player.user.username, "coy", false);
                    editDB(target.player.user.username, "shy",false);
                }
                break;
            default:
                message.author.send(`**Command Stucture:** \`!share card <user>\`\nYou must specify what type of share you want to do.\n - color\n - card`)
        }
        return;
    }//execute
}