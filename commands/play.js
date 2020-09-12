const { roles } = require("../data/serverValues");

module.exports = {
    name: 'play', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: [],
    cooldown: 0,
    description: 'Toggle Player [Two Rooms] role',
    args: false, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 2000 })
        const player = message.author;
        const role = message.guild.roles.cache.find(role => role.name === 'Player [Two Rooms]');
        if (message.member.roles.cache.some(r => r.name === role.name)) {
            //Remove role
            message.member.roles.remove(role);
        } else {
            //Add role
            message.member.roles.add(role);
        }
    }//execute
}