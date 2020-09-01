const Discord = require('discord.js');

module.exports = {
    name: 'vote', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    cooldown: 0,
    description: 'Used for a leader abdicating their position or nominating someone to ursurp the current leader.',
    args: true, 
    argsAmount: 1,
    usage: "<@mention>",
    execute(message, args){
        //args[0] = "<@!##user id##>"
        let cleanId = args[0].slice(3,args[0].length - 1);
        let target = message.guild.member(cleanId);
        let author = message.guild.member(message.author.id);
        if (message.author.roles.cache.some(r => r.name = "Leader")) {
            //The current leader is abdicating their position
            message.channel.send(`${author.displayName} is abdicating their position! They are offering it to ${target.displayName}.\n`+
                                 `<@!${cleanId}>, do you accept?`);
            
        } else {
            //Nomination for ursupring
            message.channel.send(`${author.displayName} has nominated ${target.displayName} for leader.\n`+
                                 "Cast your vote by reacting to this message");
        }
    }//execute
}