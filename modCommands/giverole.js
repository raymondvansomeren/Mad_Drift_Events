const fs = require('fs');

module.exports = {
    name: 'giverole',
    description: 'Gives a role to a user (or all users if given "everyone")',
    aliases: [''],
    usage: '[usermention] [rolename]',
    cooldown: 5,
    execute(bot, message, args)
    {
        if (!message.member.hasPermission('MANAGE_MESSAGES'))
            return message.channel.send('You don\'t have the permissions to use this command');

        const data = fs.readFileSync('./roles.json');
        const json = JSON.parse(data);
        if (json.guild.find(element => element.id === message.guild.id) === undefined)
        {
            json.guild.push({ 'id': message.guild.id, 'roles': new Array() });
            fs.writeFileSync('./roles.json', JSON.stringify(json));
        }
        // const roles = JSON.parse(data).guild.find(element => element.id === message.guild.id).roles;

        let role = message.mentions.roles.first();
        // let role = message.guild.roles.cache.find(r => r.name === args[0]);
        if (role === undefined)
            role = message.guild.roles.cache.find(r => r.name === args[1]);
        if (role === undefined)
            return message.channel.send('Could not find that role.');

        if (message.mentions.everyone || args[0] === 'everyone')
        {
            message.guild.members.fetch({ force: true })
                .then(function(members)
                {
                    members.forEach(function(member)
                    {
                        if (member.roles.cache.find(r => r.name === role.name))
                            return;

                        member.roles.add(role);
                    });
                });
            message.channel.send(`Added role \`${role.name}\` to **\`everyone\`**.`);
        }
        else
        {
            const member = message.mentions.members.first();
            if (member.roles.cache.find(r => r.name === role.name))
                return message.channel.send(`${member.displayName} already has that role.`);

            member.roles.add(role);
            message.channel.send(`Added role \`${role.name}\` to \`${member.displayName}\`.`);
        }
    },
};