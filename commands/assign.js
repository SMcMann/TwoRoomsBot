const Discord = require('discord.js');
const characters = require("../data/roles.json");
const special_chars = require("../data/specialroles.json");
let assignments = [];//TEMPORARY - FOR TESTING
//Needs to be moved to a more accessable location

module.exports = {
    name: 'assign', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    cooldown: 0,
    description: 'Assign a character to every member with the Player role',
    args: false, 
    execute(message, args){
        //Make a Collection of members with the Player role
        const player_base = message.guild.members.cache.filter(p => p.roles.cache.some(r => r.name === "OMG Con Player"));

        //Turn into an array in a random order (maybe?)
        const randomized_players = player_base.random(player_base.size);
        for (let counter = 0; counter < randomized_players.length; counter++) {
            //Assign a role to the player
            let curr_player = randomized_players[counter];
            let char_pick;
            if (counter == randomized_players.length - 1 && counter % 2 == 0) {
                //Special Case: Odd player count - Assign Gambler
                char_pick = special_chars[2];
            } else if (counter >= characters.length) {
                //Special Case: Out of characters to assign - Assign team characters
                if (counter % 2 == 0) {
                    //Assign Red Team
                    char_pick = special_chars[0];
                } else {
                    //Assign Blue Team
                    char_pick = special_chars[1];
                }
            } else if (randomized_players.length - characters.length >= 3 && counter >= characters.length && counter < characters.length + 3) {
                //Special Case: Enough room for Decoy/Target/Sniper (special_chars indices 3/4/5)
                char_pick = special_chars[counter - characters.length + 3];
            } else {
                //Regular Case
                char_pick = characters[counter];
            }
            //Add the assignment to the Collection for use in other commands
            assignments.push({
                id: curr_player.user.id,
                screenname: curr_player.user.username,
                character: char_pick
            });
            //DM the player their role
            curr_player.send(`You are the ${char_pick.name}!\n${char_pick.rules}\nGood luck!`);
        }

    }//execute
}