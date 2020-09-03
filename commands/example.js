const Discord = require('discord.js');

module.exports = {
    name: 'example', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: [],
    cooldown: 0,
    description: 'This is an example of what a command should look like',
    args: false, 
    execute(message, args){
        //do code here

        //this is an example of how to search for a role. This line seaches the player who gave the command's role collection for the role "OMG Con Player"
        let player = message.member.roles.cache.some((r) => r.name === "OMG Con Player");

        message.author.send(`Hello!`); // this is how you send a Private message
    }//execute
}