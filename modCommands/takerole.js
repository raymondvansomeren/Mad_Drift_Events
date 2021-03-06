const fs = require('fs');

module.exports = {
    name: 'takerole',
    description: 'Removes a role from a user (or all users if given "everyone")',
    aliases: [''],
    usage: '[usermention] [rolename]',
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

        const data = fs.readFileSync('./roles.json');
        const json = JSON.parse(data);
        if (json.guild.find(element => element.id === message.guild.id) === undefined)
        {
            json.guild.push({ 'id': message.guild.id, 'logchannel': '', 'roles': new Array() });
            fs.writeFileSync('./roles.json', JSON.stringify(json));
            return message.channel.send('There don\'t seem to be any joinable roles.')
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
        let role = message.mentions.roles.first();
        if (role === undefined)
            role = message.guild.roles.cache.find(ro => ro.id === roles.find(r => r.value === args[1]).id);
        if (role === undefined)
            role = message.guild.roles.cache.find(r => r.name === args[1]);
        if (role === undefined)
        {
            return message.channel.send('Could not find that role.')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }

        if (message.mentions.everyone || args[0] === 'everyone')
        {
            message.guild.members.fetch({ force: true })
                .then(function(members)
                {
                    members.forEach(function(member)
                    {
                        if (member.roles.cache.find(r => r.name === role.name))
                            return member.roles.remove(role);

                    });
                });
            message.channel.send(`Removed role \`${role.name}\` from **\`everyone\`**.`)
                .then(msg =>
                {
                    // if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    // {
                    //     message.delete({ timeout: 5000 });
                    //     msg.delete({ timeout: 5000 });
                    // }
                });
        }
        else
        {
            const member = message.mentions.members.first();
            if (!member.roles.cache.find(r => r.name === role.name))
            {
                return message.channel.send(`${member.displayName} does not have that role.`)
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 5000 });
                            msg.delete({ timeout: 5000 });
                        }
                    });
            }

            member.roles.remove(role);

            // Log
            const logChannel = JSON.parse(data).guild.find(element => element.id === message.guild.id).logchannel;
            if (logChannel !== undefined && logChannel !== '')
            {
                const channel = bot.channels.cache.get(logChannel);
                channel.send(`${message.author}: ${message.content}`);
            }
            message.channel.send(`Removed role \`${role.name}\` from \`${member.displayName}\`.`)
                .then(msg =>
                {
                    // if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    // {
                    //     message.delete({ timeout: 5000 });
                    //     msg.delete({ timeout: 5000 });
                    // }
                });
        }
    },
};