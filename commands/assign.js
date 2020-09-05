const getCharacters = require('../data/characters.json');
// const characters = [getCharacters[6], getCharacters[11], getCharacters[10], getCharacters[9]]; //Temporary change for testing Psychologist
const characters = require('../data/characters.json');
const { roles, channels } = require("../data/serverValues");
const specialChars = require('../data/specialroles.json');
const { updateGoal, clearDB, addToDB, gameReport, live, toggleLive } = require('../data/database');
const cards = require('../image/cards');

module.exports = {
    name: 'assign', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['initiate', 'gameon'],
    cooldown: 0,
    description: 'Assign a character to every member with the Player role',
    args: false, 
    execute(message, args){
        if (message.channel.type === 'dm') return;
        message.delete({ timeout: 500 })
        clearDB(); // Clears the old game
        console.log(`Assigning Roles...`)

        let activeChars = [];
        for (let c of characters) {
            if (c.active) activeChars.push(c);
        }

        //Make a Collection of members with the Player role
        let gameSize = 0
        //const player_base = message.guild.members.cache.filter(p => p.roles.cache.some(r => r.name === "OMG Con Player" && p.presence.status === 'online'));
        const player_base = message.guild.members.cache.filter(p => p.roles.cache.some(r => r.name === roles.player && p.presence.status === 'online'));
        
        const players = [...player_base.values()];
        const playerCount = players.length;
        let assigned = [];
        let gamblerN = 0;//Flag for whether the gambler is needed on even or odd
        while (players.length > 0) {
            let charPick = activeChars[assigned.length];
            if (players.length == 1 && assigned.length % 2 == gamblerN) {
                //Special Case: Gambler
                charPick = specialChars[2];
            }
            if (assigned.length < activeChars.length) {
                if (charPick.linked > 0) {
                    gamblerN = 1 - gamblerN;//Swap even/odd (only important for Decoy/Target/Sniper)
                    //Check for links in assigned
                    let linksLeft = charPick.linked.length;
                    for (let l of charPick.linked) {
                        if (assigned.includes(l)) linksLeft--;
                    }
                    if (linksLeft >= players.length) {
                        //There's not enough room to put this one and all of its links
                        assigned.push(""); //Increment assigned to go to next activeChar
                        continue;
                    }
                }
            } else {
                //The rest of the players are regular teammembers
                charPick = specialChars[players.length % 2];
            }

            if (charPick.winCon) {
                updateGoal(charPick.name,"active",true);
            }
            
            assigned.push(charPick.name);
            //Pick a random player
            let rand = Math.floor(Math.random() * players.length);
            let currPlayer = players[rand];
            players.splice(rand,1);

            let voiceChannel;
            let voiceAlert = "You have been assigned to:";
            if (players.length % 2 == 0) {
                //Assign to room 1
                console.log(`${currPlayer.player.user.username} has been assigned to Room 1`);
                voiceChannel = channels.room1;
                voiceAlert = `${voiceAlert} ${channels.room1}`;
                currPlayer.player.roles.add(currPlayer.guild.roles.find(r => r.name == roles.room1));
            } else {
                //Assign to room 2
                console.log(`${currPlayer.player.user.username} has been assigned to Room 2`);
                voiceChannel = channels.room2;
                voiceAlert = `${voiceAlert} ${channels.room2}`;
                currPlayer.player.roles.add(currPlayer.guild.roles.find(r => r.name == roles.room2));
            }
            addToDB({
                player: currPlayer,
                character: charPick,
                leader: false,
                currChannel: voiceChannel
            });
            //DM the player their role
            /*
            let username
            currPlayer.nickname !== null ? username = currPlayer.nickname : username = currPlayer.user.username; //Gets current nickname or username
            currPlayer.send({files: [cards[charPick.name.toLowerCase().replace(/\s+/g, '')]]}).then(
            currPlayer.send(`**Role:** ${charPick.name}\n**Share Color:** ${charPick.color}\n**Team:** ${charPick.alignment === 'Gray' ? 'None' : `${charPick.alignment} Team`}\n\n**[- ${charPick.name} Rules -]**\n${charPick.rules}\n\nGood luck, ${charPick.alignment === 'Gray' ? `may you achive your goals!` : `may fortune favor the ${charPick.alignment}!`}\n\n${voiceAlert}`))
                .then(console.log(`  ${charPick.name} was assigned to ${username}...`))
                .then(gameSize++) // Increases the player count
                .catch(console.error); // Shows error if we have a send error
            */
        }
        message.reply(`${gameSize} roles assigned for this game!`);
        message.author.send(gameReport())
        console.log(`${gameSize} roles assigned for this game...`);
        if (!live) toggleLive(message);
    }//execute
}