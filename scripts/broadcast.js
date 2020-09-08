const { getRooms } = require("./client");

function broadcast(msg) {
    let rooms = getRooms();
    let { room1, room2 } = rooms;
    room1.send(msg);
    room2.send(msg);
}

module.exports = { broadcast }