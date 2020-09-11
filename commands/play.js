const { roles } = require("../data/serverValues");

module.exports = {
    name: 'play', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: [],
    cooldown: 0,
    description: 'Toggle Player [Two Rooms] role',
    args: false, 
    execute(message, args){
        const player = message.author;
        if (player.roles.cache.some(r => r.name == roles.player)) {
            //Remove role
            player.roles.add(message.guild.roles.filter(r => r.name == roles.player));
        } else {
            //Add role
            player.roles.remove(message.guild.roles.filter(r => r.name == roles.player));
        }
    }//execute
}