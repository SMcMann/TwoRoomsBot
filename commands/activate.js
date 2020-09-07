const { characters, toggleCharacter, checkLive } = require("../data/database");

module.exports = {
    name: 'activate', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['deactivate','toggle','active'],
    cooldown: 0,
    description: 'Turn on or off characters in the database.',
    args: true, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 500 });
        if (checkLive()) {
            message.reply('Game is active, no switchy for you!');
            return;
        }

        let alreadyChanged = [];

        for (let char of args) {
            let charFound = undefined;
            for (let c of characters) {
                if (c.name.toLowerCase() == char.toLowerCase()) {
                    charFound = c;
                    break;
                } else if (c.name.toLowerCase() == `red ${char.toLowerCase()}`) {
                    //Also check if they entered a double role (spy/coy/shy/psych)
                    charFound = c;
                    break;
                }
            }
    
            if (charFound == undefined) {
                message.reply(`${char} is not a valid character.`);
                continue;
            }

            if (alreadyChanged.some(el => el === charFound.name)) continue;

            for (let link of charFound.links) {
                toggleCharacter(link,message);
                alreadyChanged.push(link);
            }
            toggleCharacter(charFound.name,message);
            alreadyChanged.push(charFound.name);
        }
    }
}