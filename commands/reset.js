const Discord = require('discord.js');
const assignments = require("../data/database");
const server = require("../data/server.json");

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
            if (actual_member.roles.cache.some(r => r.name == server.roles.red)) {
                actual_member.roles.remove(message.guild.roles.cache.filter(r => r.name == server.roles.red));
            }
            //Remove Blue Team
            if (actual_member.roles.cache.some(r => r.name == server.roles.blue)) {
                actual_member.roles.remove(message.guild.roles.cache.filter(r => r.name == server.roles.blue));
            }
            //Remove Gray Team
            if (actual_member.roles.cache.some(r => r.name == server.roles.gray)) {
                actual_member.roles.remove(message.guild.roles.cache.filter(r => r.name == server.roles.gray));
            }
        }

        //Reset database
        assignments.clearDB();
    }//execute
}