const { channels } = require("../data/server.json");
const { findLeader, updateLeadership, findPlayerByCharacter, getGoal } = require("../data/database");

let voting = {
    room1: false,
    room2: false
};

function setVoting(channel,set) {
    if (channel == channels.room1) voting.room1 = set;
    else voting.room2 = set;
}

function channelVoting(channel) {
    if (channel == channels.room1) return voting.room1;
    return voting.room2;
}

function runSoloVote(sentMessage, target, curr_leader) {
    setVoting(target.player.voice.channel,true);
    sentMessage.react('👍');
    sentMessage.react('👎');
    const filter = (reaction, user) => user.id == target.player.user.id;
    const collector = sentMessage.createReactionCollector(filter, { max: 1, time: 15000 });
    collector.on('collect', r => {
        if (r.emoji.name === '👍') {
            sentMessage.channel.send(`${target.player.user.username} accepted! Roles have been updated.`)
            if (curr_leader) updateLeadership(curr_leader,false);
            updateLeadership(target,true);
            //Minion winCon check
            const minion = findPlayerByCharacter("Minion");
            if (minion.player.currChannel == target.player.currChannel) {
                //Minion has failed
                updateGoal("Mastermind","status",false);
            }
        }
        if (r.emoji.name === '👎') {
            sentMessage.channel.send(`${target.player.user.username} has declined the nomination.`);
        }
    }) // End collector
    collector.on('end', collected => {
        console.log("Vote ended.");
        if (collected.size == 0) {
            sentMessage.channel.send(`${target.player.user.username} didn't respond fast enough.`)
        }
        setVoting(target.currVoice,false);
    }) //End end collector
}

function runGroupVote(sentMessage, target, curr_leader) {
    setVoting(target.player.voice.channel,true);
    sentMessage.react('👍');
    sentMessage.react('👎');
    const voteRoom = target.player.voice.channel.members;
    const majority = Math.ceil(voteRoom.size / 2);
    const filter = (reaction, user) => !user.bot && voteRoom.get(user.id).voice.channel.id == target.player.voice.channel.id;
    let posVotes = 0;
    const collector = sentMessage.createReactionCollector(filter, { max: majority, time: 15000 });
    collector.on('collect', r => {
        if (r.emoji.name === '👍') {
            posVotes++;
        }
    }) // End collector
    collector.on('end', collected => {
        console.log("Vote ended.");
        setVoting(target.currVoice,false);
        if (posVotes >= majority) {
            sentMessage.channel.send(`${target.player.user.username} has been elected as the new leader of this room! Roles have been updated`);
            if (curr_leader) updateLeadership(curr_leader,false);
            updateLeadership(target,true);
            //Mastermind and Minon winCon checks
            const masterGoal = getGoal("Mastermind");
            if (masterGoal.active) {
                const mastermind = findPlayerByCharacter("Mastermind");
                if (mastermind.player.user.username == target.player.user.username) {
                    //The mastermind has taken controll of this room
                    if (masterGoal.value == "") {
                        //First leadership
                        updateGoal("Mastermind","value",target.currChannel); 
                    } else if (masterGoal.value != target.currChannel) {
                        //Second+ leadership
                        updateGoal("Mastermind","value","both");
                    }
                }
                const minion = findPlayerByCharacter("Minion");
                if (minion.player.currChannel == target.player.currChannel) {
                    //Minion has failed
                    updateGoal("Mastermind","status",false);
                }
            }
        } else {
            sentMessage.channel.send(`${target.player.user.username} did not receive enough votes to be elected leader.`);
        }
    }) //End end collector
}

module.exports = { runSoloVote, runGroupVote, channelVoting, findLeader }