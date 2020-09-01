const Discord = require('discord.js');
const assignments = require("../data/database");

module.exports = {
    name: 'reset', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    cooldown: 0,
    description: 'Reset assignment database, as well as Red Team/Blue Team/Gray Team roles',
    args: false, 
    execute(message, args){
        //Reset roles
        for (let member of message.guild.members.cache) {
            let actual_member = member[1];
            //Remove Red Team
            if (actual_member.roles.cache.some(r => r.name == "Red Team")) {
                actual_member.roles.remove(message.guild.roles.cache.filter(r => r.name == "Red Team"));
            }
            //Remove Blue Team
            if (actual_member.roles.cache.some(r => r.name == "Blue Team")) {
                actual_member.roles.remove(message.guild.roles.cache.filter(r => r.name == "Blue Team"));
            }
            //Remove Gray Team
            if (actual_member.roles.cache.some(r => r.name == "Gray Team")) {
                actual_member.roles.remove(message.guild.roles.cache.filter(r => r.name == "Gray Team"));
            }
        }

        //Reset database
        assignments.clearDB();
    }//execute
}