const roles = {
        red: "Red Team",
        blue: "Blue Team",
        gray: "Gray Team",
        leader: "Leader",
        player: "OMG Con Player"
};
const channels = {
        room1: "Two Rooms Room 1",
        room2: "Two Rooms Room 2"
};

function getRole(guild,roleName) {
    return guild.roles.cache.filter(r => r.name == roleName);
}

module.exports = {roles, channels, getRole}