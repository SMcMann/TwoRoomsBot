const avatar = 'https://scontent.fsac1-2.fna.fbcdn.net/v/t1.0-9/117854855_3357840704261597_5605760858299843730_o.png?_nc_cat=102&_nc_sid=09cbfe&_nc_ohc=qDELSZGVMKsAX_vrV_P&_nc_ht=scontent.fsac1-2.fna&oh=fdd55030c3a4d47eeb3471893e9547e2&oe=5F7AB71B'

const admincmds = [
    { cmd: '!assign', aliases: [],  desc: 'Resets and assigns roles for new game.'},
    { cmd: '!reset', aliases: [],  desc: 'Removes all roles and clears DB.'},
    { cmd: '!debrief', aliases: [],  desc: 'Tags all players as their team color, starts end game sequence and report.'},
    { cmd: '!report', aliases: [],  desc: 'Pulls the current game report to your DM'},
    { cmd: '!round start <num>', aliases: [],  desc: 'Starts a round <num> minutes on the clock'},
]

const playercmds = [
    { cmd: '!share color <user>', aliases: [],  desc: 'Sends a request to share color simultaniously to the specified user privately.'},
    { cmd: '!share card <user>', aliases: [],  desc: 'Sends a request to share card simultaniously to the specified user privately.'},
    { cmd: '!show color <user>', aliases: [],  desc: 'Sends your color to specified user privately.'},
    { cmd: '!show card <user>', aliases: [],  desc: 'Sends your card to specified user privately'},
    { cmd: '!nominate <user>', aliases: [],  desc: 'Nominates the user to become the room leader.'},
    { cmd: '!roles', aliases: [],  desc: 'Shows you the active roles and their rules in DM.'},
    { cmd: '!roles all', aliases: [],  desc: 'Shows you the all roles in the bot and their rules in DM.'}
]

module.exports = {
    name: 'help', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    cooldown: 0,
    aliases: [],
    description: 'Sends the user the commands',
    args: false, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 2000 })

        let helpEmbed = {
            color: 0xFF0000,
            title: `[- 2R1B Bot Command List -]`,
            author: {
                name: '2R1B Bot',
                icon_url: avatar,
            },
            description: 'These are the commands for the bot, if you have any questions just ask!',
            fields: [],
            timestamp: new Date(),
            footer: {
                text: `If there are any issues with this report contact John Cleveland!`,
                icon_url: avatar,
            },
        };

        helpEmbed.fields.push({ name: '[- Player Commands -]'});
        for (let pcmd of playercmds) {
            let field = { name: `${pcmd.cmd}`, value: `${pcmd.desc}`}
            helpEmbed.fields.push(field);
        }
        helpEmbed.fields.push({ name: '\u200B', value: '\u200B' });
        helpEmbed.fields.push({ name: '[- Admin Commands -]'})
        for (let acmd of admincmds) {
            let field = { name: `${acmd.cmd}`, value: `${acmd.desc}`}
            helpEmbed.fields.push(field);
        }
        

        message.author.send({ embed: helpEmbed });
    }//execute
}