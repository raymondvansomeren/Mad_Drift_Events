const fs = require('fs');
const { prefix } = require('../config.json');

module.exports = {
    name: 'leave',
    description: 'Leave a role',
    aliases: ['leaverole'],
    usage: '[rolename]',
    cooldown: 5,
    execute(bot, message, args)
    {
        const data = fs.readFileSync('./roles.json');
        const json = JSON.parse(data);
        if (json.guild.find(element => element.id === message.guild.id) === undefined)
        {
            json.guild.push({ 'id': message.guild.id, 'logchannel': '', 'roles': new Array() });
            fs.writeFileSync('./roles.json', JSON.stringify(json));
            return message.channel.send('There don\'t seem to be any roles to leave.')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }
        const roles = JSON.parse(data).guild.find(element => element.id === message.guild.id).roles;

        if (roles === undefined || roles.length === 0)
        {
            return message.channel.send('There don\'t seem to be any roles to leave.')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        const role = message.guild.roles.cache.find(r =>
        {
            const jsonRole = roles.find(element =>
            {
                if (element !== undefined && args[0] !== undefined)
                {
                    return element.value.toLowerCase() === args[0].toLowerCase();
                }
            });
            if (jsonRole === undefined)
                return undefined;
            return r.name === jsonRole.name;
        });

        if (role === undefined)
        {
            return message.channel.send(`No role with that name found. Use \`${prefix}joinable\` to see all joinable roles.`)
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }
        message.member.roles.remove(role);

        // Log
        const logChannel = JSON.parse(data).guild.find(element => element.id === message.guild.id).logchannel;
        if (logChannel !== undefined && logChannel !== '')
        {
            const channel = bot.channels.cache.get(logChannel);
            channel.send(`${message.author}: ${message.content}`);
        }
        message.channel.send(`Relieved you from the role \`${role.name}\`.`)
            .then(msg =>
            {
                // if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                // {
                //     message.delete({ timeout: 5000 });
                //     msg.delete({ timeout: 5000 });
                // }
            });
    },
};