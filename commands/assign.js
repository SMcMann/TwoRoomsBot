const getCharacters = require('../data/roles.json');
// const characters = [getCharacters[6], getCharacters[11], getCharacters[10], getCharacters[9]]; //Temporary change for testing Psychologist
const characters = require('../data/roles.json');
const server = require("../data/server.json");
const special_chars = require('../data/specialroles.json');
const database = require('../data/database');
const cards = require('../image/cards');

module.exports = {
    name: 'assign', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: [],
    cooldown: 0,
    description: 'Assign a character to every member with the Player role',
    args: false, 
    execute(message, args){
        if (message.channel.type === 'dm') return;
        message.delete({ timeout: 500 })
        database.clearDB(); // Clears the old game
        console.log(`Assigning Roles...`)

        //TODO: Optional(?) argument to indicate a simple game (Pres/Bomb/Red T/Blue T)
        const simple = false;

        //Make a Collection of members with the Player role
        let gameSize = 0
        const player_base = message.guild.members.cache.filter(p => p.roles.cache.some(r => r.name === "OMG Con Player" && p.presence.status === 'online'));
        //const player_base = message.guild.members.cache.filter(p => p.roles.cache.some(r => r.name === server.roles.player && p.presence.status === 'online'));
        
        const players = [...player_base.values()];
        const playerCount = players.length;
        let DTS = 0; //A flag for whether the Decoy/Target/Sniper are in the game
        for (let counter = 0; counter < playerCount; counter++) {
            //Pick a random player from players
            let rand = Math.floor(Math.random() * players.length);
            let curr_player = players[rand];
            players.splice(rand,1);
            //Assign a role to the player
            let char_pick;
            if (counter == playerCount - 1 && counter % 2 == DTS) {
                //Special Case: Odd player count - Assign Gambler
                char_pick = special_chars[2];
            } else if (playerCount.length - characters.length >= 3 && counter >= characters.length && counter < characters.length + 3) {
                //Special Case: Enough room for Decoy/Target/Sniper (special_chars indices 3/4/5)
                char_pick = special_chars[counter - characters.length + 3];
                DTS = 1; //Now, the Gambler will be added if there are an even number of players
            } else if (counter >= characters.length || (counter > 1 && simple)) {
                //Special Case: Out of characters to assign - Assign team characters
                //    or, if simple, assign generic roles to the rest of the players
                if (counter % 2 == 0) {
                    //Assign Red Team
                    char_pick = special_chars[0];
                } else {
                    //Assign Blue Team
                    char_pick = special_chars[1];
                }
            } else {
                //Regular Case
                char_pick = characters[counter];
            }
            //Add the assignment to the database for use in other commands
            database.addToDB({
                player: curr_player,
                character: char_pick
            });
            //DM the player their role
            let username
            curr_player.nickname !== null ? username = curr_player.nickname : username = curr_player.user.username; //Gets current nickname or username
            curr_player.send({files: [cards[char_pick.name.toLowerCase().replace(/\s+/g, '')]]}).then(
            curr_player.send(`**Role:** ${char_pick.name}\n**Share Color:** ${char_pick.color}\n**Team:** ${char_pick.alignment} Team\n\n**[- ${char_pick.name} Rules -]**\n${char_pick.rules}\n\nGood luck, don't fail the ${char_pick.color}!`))
                .then(console.log(`  ${char_pick.name} was assigned to ${username}...`))
                .then(gameSize++) // Increases the player count
                .catch(console.error); // Shows error if we have a send error
        }
        message.reply(`${gameSize} roles assigned for this game!`);
        message.author.send(database.gameReport())
        console.log(`${gameSize} roles assigned for this game...`);
    }//execute
}