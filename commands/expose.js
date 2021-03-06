const { database, toggleDebrief, getDebrief, checkLive, getGoal, updateGoal, findPlayerByCharacter } = require("../data/database");
const { sniperFunc } = require("../scripts/endgame");
const { channels, roles } = require("../data/serverValues");
const { moveVoice } = require("../scripts/movement");

module.exports = {
    name: 'expose', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['debrief'],
    cooldown: 0,
    description: 'Changes member roles to one of Red Team/Blue Team/Gray Team for post game discussion.',
    args: false, 
    execute(message, args){
        if (message.channel.type === 'dm') {
            message.reply(`The !debrief/!expose command must be done on server by an admin.`)            
            return;
        }

        message.delete({ timeout: 500 })

        if (!message.member.roles.cache.some(el => el.name === roles.admin)) {
            message.reply('Only an admin can use this command.')
                .then(sentMessage => {
                    sentMessage.delete({ timeout: 5000 })
                });
            return;
        }

        if (message.channel.name != channels.textLobby) {
            message.reply("make sure you're doing this in the lobby so everyone can see it!")
            .then(sentMessage => {
                sentMessage.delete({ timeout: 4000 })
            });
            return;
        }

        if (!checkLive()) {
            message.reply('No game is active, I have nothing to expose!');
            return;
        };

        console.log("Starting exposure of results...\nChecking win conditions.");

        if (!getDebrief()) toggleDebrief();

        //Initiate all win con checks (starting with Gambler)
        let gambleGoal = getGoal("Gambler");
        message.reply(`Calculating final results...`)
        if (gambleGoal.active) { 
            const gambler = findPlayerByCharacter("Gambler").player;
            message.channel.send(`Gambler <@${gambler.user.id}>, who do you think is going to win?`+ "\n 🟦 - Blue Team" + "\n 🟥 - Red Team" + "\n ⬜ - Neither")
            .then(sentMessage => {
                sentMessage.react('🟦');
                sentMessage.react('🟥');
                sentMessage.react('⬜');
                const filter = (reaction,user) => user.id === gambler.user.id;
                const collector = sentMessage.createReactionCollector(filter, { max: 1 });
                collector.on('collect', r => {
                    if (r.emoji.name === '🟦') updateGoal("Gambler","value","Blue");
                    if (r.emoji.name === '🟥') updateGoal("Gambler","value","Red");
                    if (r.emoji.name === '⬜') updateGoal("Gambler","value","Gray");
                    sniperFunc(message);
                });
            })
            .catch(console.error);
        } else {
            sniperFunc(message);
        }

        //Move everyone to the Neutral room
        for (let entry of database) {
            moveVoice(message,entry,channels.neutral);
            
        }
    }//execute
}