const Discord = require('discord.js');
const assignments = require("../data/database");
/*
assignments.database[i] = {
    player: curr_player,
    character: char_pick
}
*/
module.exports = {
    name: 'reveal', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    cooldown: 0,
    description: 'Changes member roles to one of Red Team/Blue Team/Gray Team for post game discussion.',
    args: false, 
    execute(message, args){
        for (let member of assignments.database) {
            let new_role;
            if (member.character.alignment == "Red") {
                new_role = message.guild.roles.cache.filter(r => r.name == "Red Team");
            } else if (member.character.alignment == "Blue") {
                new_role = message.guild.roles.cache.filter(r => r.name == "Blue Team");
            } else {
                new_role = message.guild.roles.cache.filter(r => r.name == "Gray Team");
            }
            member.player.roles.add(new_role)
                .then(console.log(`  ${member.username} assigned to ${new_role}...`))
                .catch(console.error); // Shows error if we have a send error;
        }
    }//execute
}