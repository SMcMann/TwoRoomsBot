const { roles } = require("../data/serverValues");

const keepRoles = [roles.omgPlayer, roles.omgVolunteer, roles.admin, roles.player, "@everyone"];

function keepRolesFilter(role) {
    return keepRoles.some(k => k == role.name);
}

/*function removeRole(player,roleName) {
    if (player.roles.cache.some(r => r.name == roleName)) {
        console.log(`Removing ${roleName} from ${player.user.username}`);
        player.roles.remove(player.guild.roles.cache.filter(r => r.name == roleName))
            .catch(console.error);
    }
}*/

function resetRoles(message) {
    message.channel.send("Resetting roles")
    .then(sentMessage => {
        for (let member of sentMessage.guild.members.cache) {
            let currMember = member[1];
            let currRoles = currMember.roles.cache;
            filteredRoles = currRoles.filter(r => keepRolesFilter(r));
            currMember.roles.set(filteredRoles);
            //Trows Permission error after a few seconds, but still works
        }
    })
    .catch(console.error);
}

module.exports = { resetRoles }