const { characters, toggleCharacter } = require("../data/database");

module.exports = {
    name: 'activate', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['deactivate'],
    cooldown: 0,
    description: 'Share your team or color with another user in your room.',
    args: true, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 500 });
        if (!checkLive()) {
            message.reply('No game is active, contact a moderator!');
            return;
        }

        const char = args[0];

        let charFound = false;
        for (let c in characters) {
            if (c.name == char.toLowerCase()) {
                char = c;
                charFound = true;
                break;
            }
        }

        if (!charFound) {
            message.reply(`${char} is not a valid character.`);
            return;
        }

        toggleCharacter(char.name,message);
    }
}