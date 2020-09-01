const Discord = require('discord.js');
let assignments = require("../data/database");
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
            let r = member.player.roles.cache;
            if (member.character.alignment == "Red") {
                r.add(message.guild.roles.cache.filter(r => r.name == "Red Team"));
            } else if (member.character.alignment == "Blue") {
                r.add(message.guild.roles.cache.filter(r => r.name == "Blue Team"));
            } else {
                r.add(message.guild.roles.cache.filter(r => r.name == "Gray Team"));
            }
        }
    }//execute
}