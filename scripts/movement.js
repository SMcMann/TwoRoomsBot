const { roles, channels } = require("../data/serverValues");
const { updateVoice, getDebrief } = require("../data/database");

function moveVoice (message,target,room) {
    if (!getDebrief()) updateVoice(target,room); //Update currChannel
    if (target.player.voice.channelID === undefined) {
        // message.channel.send(`Cannot move ${target.player.user.username} because they are not in voice.`);
        console.log(`Cannot move ${target.player.user.username} because they are not in voice.`)
    } else {
        console.log(`Moving ${target.player.user.username} to ${room}`);
        target.player.edit({channel: target.player.guild.channels.cache.find(c => c.name == room)}) //Move
            .catch(console.error);
    }   
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
    console.log(`Moving ${target.player.user.username} to ${roomA}`)
    updateVoice(target,roomA); //Update currChannel

    target.player.roles.add(target.player.guild.roles.cache.find(r => r.name == roleA)); //Update role
    target.player.roles.remove(target.player.guild.roles.cache.find(r => r.name == roleB)); //Update role

    if (target.player.voice.channelID === undefined) {
        // message.channel.send(`Cannot move ${target.player.user.username} because they are not in voice.`);
        console.log(`Cannot move ${target.player.user.username} because they are not in voice.`)
    } else {
        target.player.edit({channel: target.player.guild.channels.cache.find(c => c.name == roomA)}) //Move
        .catch(console.error);             
    }
}

module.exports = { toggleRoom, moveVoice };