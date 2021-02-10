const fs = require('fs');
const { modPrefix } = require('../config.json');

module.exports = {
    name: 'removerole',
    description: 'Removes a role as joinable',
    aliases: [''],
    usage: '[rolemention]',
    cooldown: 5,
    execute(bot, message, args)
    {
        if (!message.member.hasPermission('MANAGE_ROLES'))
        {
            return message.channel.send('You don\'t have the permissions to use this command')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }
        if (args.length !== 1)
        {
            return message.channel.send(`Please just mention/name the role you want to remove (\`${modPrefix}removerole @foo\` / \`${modPrefix}removerole foo\`)`)
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        const data = fs.readFileSync('./roles.json');
        const json = JSON.parse(data);
        const roles = json.guild.find(element => element.id === message.guild.id).roles;
        let role = message.mentions.roles.first();
        if (role === undefined)
            role = roles.find(r => r.value === args[1]);
        if (role === undefined)
            role = message.guild.roles.cache.find(r => r.name === args[0]);
        if (role === undefined)
        {
            return message.channel.send('Could not find that role')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        if (json.guild.find(element => element.id === message.guild.id) === undefined)
            json.guild.push({ 'id': message.guild.id, 'logchannel': '', 'roles': new Array() });

        for (;;)
        {
            const index = roles.indexOf(roles.find(element => element.name === role.name || element.value === args[0]));
            if (index > -1)
                json.guild.find(element => element.id === message.guild.id).roles.splice(index, 1);
            else
                break;
        }

        fs.writeFileSync('./roles.json', JSON.stringify(json));

        // Log
        const logChannel = JSON.parse(data).guild.find(element => element.id === message.guild.id).logchannel;
        if (logChannel !== undefined && logChannel !== '')
        {
            const channel = bot.channels.cache.get(logChannel);
            channel.send(`${message.author}: ${message.content}`);
        }

        message.channel.send(`Removed \`${args[0]}\` from joinable roles.`)
            .then(msg =>
            {
                if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                {
                    message.delete({ timeout: 5000 });
                    msg.delete({ timeout: 5000 });
                }
            });
    },
};