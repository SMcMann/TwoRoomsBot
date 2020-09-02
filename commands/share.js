const Discord = require('discord.js');
const assignments = require("../data/database");
const { editDB, findPlayer } = require('../data/database');

module.exports = {
    name: 'share', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    cooldown: 0,
    description: 'Share your team or color with another user in your room.',
    args: true, 
    execute(message, args){
        let user; // Creates target user variable
        let array = [...args]; // Copies the args into an array
        array.shift(); // Removes the command Arg
        
        // FOR Loop recombines the username back into a string
        for (let el of array) {
            el.trim(); // Removes any whitespace on the element....
            el === array[0] ? user = el : user = `${user} ${el}` // Reconstructs string
        };

        let target = findPlayer(args[0]); // Finds the DB save of the target
        let initiator = findPlayer(message.author.username); // Finds the DB save of current user
        
        // Invalid user check
        if (target !== undefined) {
            message.reply(`${user} is a valid target!`);
        } else {
            // Errors out if the user isn't found in the database
            message.reply(`${user} is not a valid share target!`);
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

        //adding readtion
        let type = 'cancel';

        message.reply(`Please react to share your:\n🇨olor\n🇷ole\n❌ to cancel`).then(sentMessage => {
            sentMessage.react('🇨');
            sentMessage.react('🇷');
            sentMessage.react('❌');
            const filter = (reaction, user) => user.id === initiator.player.id// 
            const collector = sentMessage.createReactionCollector(filter, { time: 600000, max: 1 });
            collector.on('collect', r => {
                console.log(`Collected ${r.emoji.name}`)      
                switch(r.emoji.name){
                    case('🇷'):
                        if (initiator.character.coy) {
                            initiator.player.user.send("Sorry, you can't card share. You have the 'Coy' condition. Try seeing a Psychologist.");
                            return;
                        }
                        target.player.user.send(`${message.author.username}'s role is ${initiator.character.name} and color is ${initiator.character.color}!`)
                            .then(console.log(`${message.author.username} shared their card with ${user}`))
                            .then(message.reply(`Your card was successfully shared with ${target.player.user.username}`))
                            .catch(console.error);
                        // TO-DO change any flags in the DB that needs to change due to CARD share...
                        if (initiator.character.name == "Red Psychologist" || initiator.character.name == "Blue Psychologist") {
                            console.log("Attempting to remove conditions");
                            editDB(target.player.user.username, "coy", false);
                            editDB(target.player.user.username, "shy",false);
                        }
                        break;
                    case('🇨'):
                        target.player.user.send(`${message.author.username}'s color is ${initiator.character.color}`)
                            .then(console.log(`${message.author.username} shared their color with ${user}`))
                            .then(message.reply(`Your color was successfully shared with ${target.player.user.username}`))
                            .catch(console.error);
                        // TO-DO change any flags in the DB that needs to change due to COLOR share... 
                        break;
                    case('❌'):
                        message.reply(`Cancelling Request`);
                        return;
                }//switch
            }); //collector         

        });//message.reply
        
        /*
        switch (cmd) {
            case('color'):
                target.player.user.send(`${message.author.username}'s color is ${player.character.color}`)
                    .then(console.log(`${message.author.username} shared their color with ${user}`))
                    .then(message.reply(`Your color was successfully shared with ${target.player.user.username}`))
                    .catch(console.error);
                // TO-DO change any flags in the DB that needs to change due to COLOR share...    
                break;
            case('card'):
                if (player.character.coy) {
                    player.player.user.send("Sorry, you can't card share. You have the 'Coy' condition. Try seeing a Psychologist.");
                    return;
                }
                target.player.user.send(`${message.author.username}'s role is ${player.character.name} and color is ${player.character.color}!`)
                    .then(console.log(`${message.author.username} shared their card with ${user}`))
                    .then(message.reply(`Your card was successfully shared with ${target.player.user.username}`))
                    .catch(console.error);
                // TO-DO change any flags in the DB that needs to change due to CARD share...
                if (player.character.name == "Red Psychologist" || player.character.name == "Blue Psychologist") {
                    console.log("Attempting to remove conditions");
                    editDB(target.player.user.username, "coy", false);
                    editDB(target.player.user.username, "shy",false);
                }
                break;
            default:
                message.reply(`You must specify what type of share you want to do.\n - color\n - card`)
        }
        */
        return;
    }//execute
}