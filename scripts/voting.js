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
    setVoting(target.channel,true);
    sentMessage.react('👍');
    sentMessage.react('👎');
    const filter = (reaction, user) => user.id == target.user.id;
    const leaderR = message.guild.roles.cache.filter(r => r.name == server.roles.leader);
    const collector = sentMessage.createReactionCollector(filter, { max: 1, time: 15000 });
    collector.on('collect', r => {
        if (r.emoji.name === '👍') {
            sentMessage.reply(`${target.displayName} accepted! Roles have been updated.`)
            if (curr_leader) {
                curr_leader.roles.remove(leaderR);
            }
            target.roles.add(leaderR)
        }
        if (r.emoji.name === '👎') {
            sentMessage.reply(`${target.displayName} has declined the nomination.`);
        }
    }) // End collector
    collector.on('end', collected => {
        console.log("Vote ended.");
        setVoting(initiator.voice.channel,false);
    }) //End end collector
}

function runGroupVote(sentMessage, target, curr_leader) {
    setVoting(target.channel,true);
    sentMessage.react('👍');
    sentMessage.react('👎');
    const filter = (reaction, user) => user.voice.channel.id == target.voice.channel.id;
    const leaderR = message.guild.roles.cache.filter(r => r.name == server.roles.leader);
    let posVotes = 0;
    const collector = sentMessage.createReactionCollector(filter, { time: 30000 });
    collector.on('collect', r => {
        if (r.emoji.name === '👍') {
            posVotes++;
        }
    }) // End collector
    collector.on('end', collected => {
        console.log("Vote ended.");
        setVoting(initiator.voice.channel,false);
        const roomSize = initiator.voice.channel.members.size;
        if (posVotes >= roomSize/2) {
            sentMessage.reply(`${target.displayName} has been elected as the new leader of this room! Roles have been updated`);
            if (curr_leader) {
                curr_leader.roles.remove(leaderR);
            }
            target.roles.add(leaderR);
        } else {
            sentMessage.reply(`${target.displayName} did not receive enough votes to be elected leader.`);
        }
    }) //End end collector
}

module.exports = { runSoloVote, runGroupVote, channelVoting }