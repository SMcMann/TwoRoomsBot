const server = require("../data/server.json");

let voting = {
    room1: false,
    room2: false
};

function setVoting(channel,set) {
    if (channel.name == server.channels.room1) voting.room1 = set;
    else voting.room2 = set;
}

function channelVoting(channel) {
    if (channel.name == server.channels.room1) return voting.room1;
    return voting.room2;
}

function runSoloVote(sentMessage, target, curr_leader) {
    setVoting(target.voice.channel,true);
    sentMessage.react('👍');
    sentMessage.react('👎');
    const filter = (reaction, user) => user.id == target.user.id;
    const leaderR = sentMessage.guild.roles.cache.filter(r => r.name == server.roles.leader);
    const collector = sentMessage.createReactionCollector(filter, { max: 1, time: 15000 });
    collector.on('collect', r => {
        if (r.emoji.name === '👍') {
            sentMessage.channel.send(`${target.user.username} accepted! Roles have been updated.`)
            if (curr_leader) {
                curr_leader.roles.remove(leaderR);
            }
            target.roles.add(leaderR)
        }
        if (r.emoji.name === '👎') {
            sentMessage.channel.send(`${target.user.username} has declined the nomination.`);
        }
    }) // End collector
    collector.on('end', collected => {
        console.log("Vote ended.");
        if (collected.size == 0) {
            sentMessage.channel.send(`${target.user.username} didn't respond fast enough.`)
        }
        setVoting(target.voice.channel,false);
    }) //End end collector
}

function runGroupVote(sentMessage, target, curr_leader) {
    setVoting(target.voice.channel,true);
    sentMessage.react('👍');
    sentMessage.react('👎');
    const voteRoom = target.voice.channel.members;
    const filter = (reaction, user) => !user.bot && voteRoom.get(user.id).voice.channel.id == target.voice.channel.id;
    const leaderR = sentMessage.guild.roles.cache.filter(r => r.name == server.roles.leader);
    let posVotes = 0;
    const collector = sentMessage.createReactionCollector(filter, { time: 15000 });
    collector.on('collect', r => {
        if (r.emoji.name === '👍') {
            posVotes++;
        }
    }) // End collector
    collector.on('end', collected => {
        console.log("Vote ended.");
        setVoting(target.voice.channel,false);
        const roomSize = voteRoom.size;
        if (posVotes >= roomSize/2) {
            sentMessage.channel.send(`${target.user.username} has been elected as the new leader of this room! Roles have been updated`);
            if (curr_leader) {
                curr_leader.roles.remove(leaderR);
            }
            target.roles.add(leaderR);
        } else {
            sentMessage.channel.send(`${target.user.username} did not receive enough votes to be elected leader.`);
        }
    }) //End end collector
}

module.exports = { runSoloVote, runGroupVote, channelVoting }