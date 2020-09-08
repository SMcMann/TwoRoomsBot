const { channels } = require("../data/serverValues")
let room1
let room2
let lobby

function setTextRooms(client) {
    room1 = client.channels.cache.find(channel => channel.name === channels.text1);
    room2 = client.channels.cache.find(channel => channel.name === channels.text2);
    lobby = client.channels.cache.find(channel => channel.name === channels.textLobby);
}

function getRooms() {
    return { room1, room2, lobby }
}


module.exports = { setTextRooms, getRooms };