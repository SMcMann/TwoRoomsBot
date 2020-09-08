const roles = {
        red: "Red Team",
        blue: "Blue Team",
        gray: "Gray Team",
        room1: "Room 1",
        room2: "Room 2",
        player: "Player [Two Rooms]",
        admin: "Admin [Two Rooms]",
        omgPlayer: "OMG Con Player",
        omgVolunteer: "OMG Con Volunteers"
};
const channels = {
        room1: "Room 1 - Main",
        room1A: "Room 1 - Breakout A",
        room1B: "Room 1 - Breakout B",
        room2: "Room 2 - Main",
        room2A: "Room 2 - Breakout A",
        room2B: "Room 2 - Breakout B",
        neutral: "Neutral Lobby",
        text1: "room-1",
        text2: "room-2",
        textLobby: "lobby-two-rooms"
};

function getRole(guild, roleName) {
    return guild.roles.cache.filter(r => r.name == roleName);
}

module.exports = {roles, channels, getRole}