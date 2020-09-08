const { getUserFromArgs } = require("../scripts/args");
const { findPlayer, checkLive, getGoal, findPlayerByCharacter, updateGoal, getRound } = require("../data/database");
const { toggleRoom } = require("../scripts/movement");


module.exports = {
    name: 'move', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['switch'],
    cooldown: 0,
    description: 'Moves a player from their current room to the opposite',
    args: false, 
    execute(message, args){
        if (message.channel.type === 'dm') return;
        if (!checkLive()) {
            message.reply('No game is active, contact a moderator!');
            return;
        }
        message.delete({ timeout: 1000 });
        let user = getUserFromArgs([...args]);

        // If statement checks for a mention instead of a user, and switches the mention for the mentioned user
        if (user.startsWith('<@')) {
            let mention = message.mentions.users.first();
            user = mention.username
            console.log(`Mention detected, username now: ${user}`)
        }

        let target = findPlayer(user); // Finds the DB save of the target

        if (target.leader) { 
            message.reply(`Cannot move ${target.player.user.username} because they are the leader.`);
            return;
        }

        toggleRoom(message,target);

        //Traveler and Agoraphobe winCons
        const travelGoal = getGoal("Traveler");
        const agoraGoal = getGoal("Agoraphobe");
        if (travelGoal.active) {
            const traveler = findPlayerByCharacter("Traveler");
            if (target.character.name == traveler.character.name) {
                //Increment the traveler's move count
                let moves = travelGoal.value[0] + 1;
                updateGoal(traveler,"value",moves);
            }
            const agoraphobe = findPlayerByCharacter("Agoraphobe");
            if (target.character.name == agoraphobe.character.name) {
                //The agoraphobe fails
                updateGoal(agoraphobe,"status",false);
            }
        }
    }//execute
}