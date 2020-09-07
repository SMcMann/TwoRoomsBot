const { roles, channels } = require("../data/serverValues");
const { updateVoice, getDebrief } = require("../data/database");

function moveVoice (message,target,room) {
    message.channel.send(`Moving ${target.player.user.username} to ${room}`)
        .then(() => {
            //Update currChannel
            if (!getDebrief()) updateVoice(target,room);
            //Move
            if (target.player.voice.channelID === undefined) {
                // message.channel.send(`Cannot move ${target.player.user.username} because they are not in voice.`);
                console.log(`Cannot move ${target.player.user.username} because they are not in voice.`)
            } else {
                target.player.edit({channel: target.player.guild.channels.cache.find(c => c.name == room)});
            }
        })
        .catch(console.error);
}

function toggleRoom (message,target) {
    let roomA, roomB;
    let roleA, roleB;
    if (target.currChannel == channels.room1) {
        roomA = channels.room2;
        roleA = roles.room2;
        roomB = channels.room1;
        roleB = roles.room1;
    } else {
        roomA = channels.room1;
        roleA = roles.room1;
        roomB = channels.room2;
        roleB = roles.room2;
    }
    message.channel.send(`Moving ${target.player.user.username} to ${roomA}`)
        .then(sentMessage => {
            //Update currChannel
            updateVoice(target,roomA);
            //Update role
            target.player.roles.add(target.player.guild.roles.cache.find(r => r.name == roleA));
            target.player.roles.remove(target.player.guild.roles.cache.find(r => r.name == roleB));
            //Move
            if (target.player.voice.channelID === undefined) {
                // message.channel.send(`Cannot move ${target.player.user.username} because they are not in voice.`);
                console.log(`Cannot move ${target.player.user.username} because they are not in voice.`)
            } else {
                target.player.edit({channel: target.player.guild.channels.cache.find(c => c.name == roomA)});
            }
        })
        .catch(console.error);
}

module.exports = { toggleRoom, moveVoice };