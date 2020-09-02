const Discord = require('discord.js');

const admincmds = [
    `:white_small_square: \`!assign\` - Resets and starts a game.`,
    `:white_small_square: \`!reset\` - Removes all roles and clears DB.`,
    `:white_small_square: \`!reveal\` - Tags all players as their team color`,
    `:white_small_square: \`!report\` - Pulls the current game report to your DM`
]

const playercmds = [
    `:white_small_square: \`!share color <user>\`- Sends your color to specified user privately`,
    `:white_small_square: \`!share card <user>\` - Sends your role name and color to specified user privately`,
    `:white_small_square: \`!roles\` - Floods you with all roles in the game.`,
    `:white_small_square: \`!vote <user>\` - Nominates the user to become the room leader.`
]


module.exports = {
    name: 'help', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    cooldown: 0,
    description: 'Sends the user the commands',
    args: false, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 2000 })
        let header = `**[- Bot Command List -]**\nThanks for asking for help, the answer is 42 and below are the bot commands.\n`
        let adminHeader = `:small_red_triangle_down: Admin Commands\n`
        let adminBody = ''
        let playerHeader = `:small_red_triangle_down: Player Commands\n`
        let playerBody =''
        for (let acmd of admincmds) {
            adminBody = `${adminBody}${acmd}\n`
        }
        for (let pcmd of playercmds) {
            playerBody = `${playerBody}${pcmd}\n`
        }
        message.author.send(`${header}\n${adminHeader}${adminBody}\n${playerHeader}${playerBody}`);
    }//execute
}