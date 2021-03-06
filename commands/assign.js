//const characters = require('../data/characters.json');
const { roles, channels } = require("../data/serverValues");
const specialChars = require('../data/specialroles.json');
const { characters, clone, updateGoal, clearDB, addToDB, gameReport, toggleLive, checkLive, toggleCharacter, getGameCount, incrementGame } = require('../data/database');
const { toggleRoom } = require("../scripts/movement");
const { getCard } = require('../image/cards');
const { getRooms } = require("../scripts/client");

module.exports = {
    name: 'assign', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['initiate', 'gameon'],
    cooldown: 0,
    description: 'Assign a character to every member with the Player role',
    args: false, 
    execute(message, args) {
        if (message.channel.type === 'dm') {
            message.reply(`The !assign command must be done on server by an admin.`)            
            return;
        }

        message.delete({ timeout: 500 })

        if (!message.member.roles.cache.some(el => el.name === roles.admin)) {
            message.reply('Only an admin can use this command.')
                .then(sentMessage => {
                    sentMessage.delete({ timeout: 5000 })
                });
            return;
        }

        clearDB(); // Clears the old game
        // resetRoles(message);
        console.log(`Assigning Roles...`);

        //Make a Collection of members with the Player role
        let gameSize = 0
        const player_base = message.guild.members.cache.filter(p => p.roles.cache.some(r => r.name === roles.player && p.presence.status === 'online'));
        
        const rooms = getRooms();
        const players = [...player_base.values()];
        const playerCount = players.length;
        let assigned = [];
        let gamblerN = 0;//Flag for whether the gambler is needed on even or odd
        let inRoom1 = 0;//Counter for determining room assignment

        if (playerCount < 10 && characters[6].active) {
            message.channel.send("Deactivating Coyboys due to small game. Reactivate them with the `!activate` command.");
            toggleCharacter("Red Coyboy",message);
            toggleCharacter("Blue Coyboy",message);
        }

        let activeChars = [];
        for (let c of characters) {
            if (c.active && !c.special) activeChars.push(c);
        }

        while (players.length > 0) {
            let charPick = activeChars[assigned.length];
            if (players.length == 1 && assigned.length % 2 == gamblerN) {
                //Special Case: Gambler
                charPick = specialChars[2];
            }
            if (assigned.length < activeChars.length) {
                if (charPick.linked > 0) {
                    //Check for links in assigned
                    let linksLeft = charPick.linked.length;
                    for (let l of charPick.linked) {
                        if (assigned.includes(l)) linksLeft--;
                    }
                    if (linksLeft >= players.length) {
                        //There's not enough room to put this one and all of its links
                        assigned.push(""); //Increment assigned to go to next activeChar
                        continue;
                    } else gamblerN = 1 - gamblerN;//Swap even/odd (only important for Decoy/Target/Sniper)
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
            let voiceAlert = "You have been assigned to";
            if ((Math.random() < 0.5 && inRoom1 < playerCount/2) || players.length < playerCount/2 - inRoom1) {
                //Assign to room 1
                inRoom1++;
                console.log(`${currPlayer.user.username} has been assigned to Room 1`);
                rooms.room1.send(`${currPlayer.user.username} has been assigned to Room 1`)
                voiceChannel = channels.room2;//Opposite because moveFunc will move to correct
                voiceAlert = `${voiceAlert} ${channels.room1}`;
            } else {
                //Assign to room 2
                console.log(`${currPlayer.user.username} has been assigned to Room 2`);
                rooms.room2.send(`${currPlayer.user.username} has been assigned to Room 2`);
                voiceChannel = channels.room1;
                voiceAlert = `${voiceAlert} ${channels.room2}`;
            }

            let newPlayer = {
                player: currPlayer,
                character: clone(charPick),
                leader: false,
                currChannel: voiceChannel
            };

            addToDB(newPlayer);
            toggleRoom(message, newPlayer)

            // DM the player their role
            let username
            currPlayer.nickname !== null ? username = currPlayer.nickname : username = currPlayer.user.username; //Gets current nickname or username
            currPlayer.send(`${voiceAlert}`, { embed: getCard(charPick, false) })
                .then(console.log(`  ${charPick.name} was assigned to ${username}...`))
                .then(gameSize++) // Increases the player count
                .catch(console.error); // Shows error if we have a send error
        }

        incrementGame();
        console.log(`${gameSize} roles assigned for game ${getGameCount()}...`);
        message.reply(`${gameSize} roles assigned for game ${getGameCount()}!`)
            .then(message.author.send({ embed: gameReport() }))
            .then(() => { if (!checkLive()) toggleLive(message) })
            .catch(console.error);
    }//execute
}