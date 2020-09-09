const { characterReport } = require('../data/database');

module.exports = {
    name: 'roles', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: [],
    cooldown: 0,
    description: 'This command returns the availible roles.',
    args: true, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 500 });

        if (args.length < 1 || args[0] === 'active') {
            message.author.send({ embed: characterReport(false) });
            return;
        }

        if (args[0].toLowerCase() === 'all') {
            message.author.send({ embed: characterReport(true) });
            return;
        }
    }//execute
}