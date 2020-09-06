const { roles } = require("../data/serverValues");

function removeRole(player,roleName) {
    if (player.roles.cache.some(r => r.name == roleName)) {
        player.roles.remove(player.guild.roles.cache.filter(r => r.name == roleName));
    }
}

function resetRoles(message) {
    message.channel.send("Resetting roles")
    .then(sentMessage => {
        for (let member of sentMessage.guild.members.cache) {
            let currMember = member[1];
            removeRole(currMember, roles.room1);
            removeRole(currMember, roles.room2);
            removeRole(currMember, roles.red);
            removeRole(currMember,roles.blue);
            removeRole(currMember,roles.gray);
            removeRole(currMember,roles.leader);
        }
    })
    .catch(console.error);
}

module.exports = { resetRoles }