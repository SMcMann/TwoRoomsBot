const characters = require('../data/characters.json');
const { roles, channels } = require("../data/serverValues");
const specialChars = require('../data/specialroles.json');
const { updateGoal, clearDB, addToDB, gameReport, toggleLive, checkLive } = require('../data/database');
const cards = require('../image/cards');
const { resetRoles } = require("../scripts/resetting");
const { toggleRoom } = require("../scripts/movement");
const avatar = 'https://scontent.fsac1-2.fna.fbcdn.net/v/t1.0-9/117854855_3357840704261597_5605760858299843730_o.png?_nc_cat=102&_nc_sid=09cbfe&_nc_ohc=qDELSZGVMKsAX_vrV_P&_nc_ht=scontent.fsac1-2.fna&oh=fdd55030c3a4d47eeb3471893e9547e2&oe=5F7AB71B'


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
        resetRoles(message);
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
        let inRoom1 = 0;//Counter for determining room assignment
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
            let voiceAlert = "**Room:**";
            if ((Math.random() < 0.5 && inRoom1 < playerCount/2) || players.length < playerCount/2 - inRoom1) {
                //Assign to room 1
                inRoom1++;
                console.log(`${currPlayer.user.username} has been assigned to Room 1`);
                voiceChannel = channels.room2;//Opposite because moveFunc will move to correct
                voiceAlert = `${voiceAlert} ${channels.room1}`;
            } else {
                //Assign to room 2
                console.log(`${currPlayer.user.username} has been assigned to Room 2`);
                voiceChannel = channels.room1;
                voiceAlert = `${voiceAlert} ${channels.room2}`;
            }

            let newPlayer = {
                player: currPlayer,
                character: charPick,
                leader: false,
                currChannel: voiceChannel
            };

            addToDB(newPlayer);

            // DM the player their role
            let username
            currPlayer.nickname !== null ? username = currPlayer.nickname : username = currPlayer.user.username; //Gets current nickname or username

            // Creates the embed for the card
            let cardEmbed = {
                color: charPick.color === 'Red' ? 0xFF0000 : charPick.color === 'Blue' ? 0x0099ff : 0x808080,
                title: `You have been delt the ${charPick.name} Card`,
                author: {
                    name: 'Watcher Bot',
                    icon_url: avatar,
                },
                description: `**Share Color:** ${charPick.color}\n**Team:** ${charPick.alignment === 'Gray' ? 'None' : `${charPick.alignment} Team`}\n${voiceAlert}`,
                fields: [
                    {
                        name: `${charPick.name} Rules`,
                        value: `${charPick.rules}`,
                    }
                ],
                image: {
                    url: cards[charPick.name.toLowerCase().replace(/\s+/g, '')],
                },
                timestamp: new Date(),
                footer: {
                    text: `Good luck, ${charPick.alignment === 'Gray' ? `may you achive your goals!` : `may fortune favor the ${charPick.alignment}!`}`,
                    icon_url: avatar,
                },
            };

            currPlayer.send({ embed: cardEmbed })
                .then(toggleRoom(message,newPlayer))
                .then(console.log(`  ${charPick.name} was assigned to ${username}...`))
                .then(gameSize++) // Increases the player count
                .catch(console.error); // Shows error if we have a send error
        }
        message.reply(`${gameSize} roles assigned for this game!`);
        message.author.send({ embed: gameReport() })
        console.log(`${gameSize} roles assigned for this game...`);
        if (!checkLive()) toggleLive(message);
    }//execute
}