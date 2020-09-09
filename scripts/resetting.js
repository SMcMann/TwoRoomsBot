const { roles } = require("../data/serverValues");

const keepRoles = [roles.omgPlayer, roles.admin, roles.player, "@everyone"];
const clearRoles = [roles.room1, roles.room2, roles.red, roles.blue, roles.gray];

function keepRolesFilter(role) {
    return clearRoles.some(k => k == role.name);
}

/*function removeRole(player,roleName) {
    if (player.roles.cache.some(r => r.name == roleName)) {
        console.log(`Removing ${roleName} from ${player.user.username}`);
        player.roles.remove(player.guild.roles.cache.filter(r => r.name == roleName))
            .catch(console.error);
    }
}*/

function resetRoles(message) {
    const player_base = message.guild.members.cache.filter(p => p.roles.cache.some(r => r.name === roles.player));
    const online = message.guild.members.cache.filter(p => p.roles.cache.some(r => r.name === roles.player && p.presence.status === 'online'));
    message.channel.send("Resetting Server roles...")
        .then(sentMessage => {
            for (let member of player_base) {
                let currMember = member[1];
                let currRoles = currMember.roles.cache;
                //I think there is still a problem with permissions.
                //This shouldn't mess with the "OMG Con Volunteers" role
                filteredRoles = currRoles.filter(r => keepRolesFilter(r));
                currMember.roles.remove(filteredRoles)
                    .catch(console.error);
            }
            console.log(`Roles finally reset...`)
        })
        .then(message.channel.send(`${player_base.size} players currently tagged to play!\n${online.size} players currently active...`))
        .catch(console.error);
}

module.exports = { resetRoles }