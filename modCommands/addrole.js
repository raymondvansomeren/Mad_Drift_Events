const fs = require('fs');
const { prefix, modPrefix } = require('../config.json');

module.exports = {
    name: 'addrole',
    description: 'Adds a role as joinable',
    aliases: [''],
    usage: `[rolemention] [rolename (no_spaces)(value to give when joining the role : \`${prefix}join rolename\`]`,
    cooldown: 5,
    execute(bot, message, args)
    {
        if (!message.member.hasPermission('MANAGE_ROLES'))
            return message.channel.send('You don\'t have the permissions to use this command');
        if (args.length !== 2)
            return message.channel.send(`Please just mention the role you want to add and after that the value you want people to use to join that role (\`${modPrefix}addrole @foo bar\`)`);

        let role = message.mentions.roles.first();
        if (role === undefined)
            role = message.guild.roles.cache.find(r => r.name === args.shift());
        if (role === undefined)
            return message.channel.send('Could not find that role');


        const data = fs.readFileSync('./roles.json');
        const json = JSON.parse(data);
        if (json.guild.find(element => element.id === message.guild.id) === undefined)
            json.guild.push({ 'id': message.guild.id, 'roles': new Array() });

        if (json.guild.find(element => element.id === message.guild.id).roles.find(element => element.name === role.name || element.value === args[1]))
            return message.channel.send('That role already exists in the joinable roles.');
        json.guild.find(element => element.id === message.guild.id).roles.push({ 'name': role.name, 'id': role.id, 'value': args[1] });

        fs.writeFileSync('./roles.json', JSON.stringify(json));

        message.channel.send(`Added \`${role.name}\` to joinable roles.`);
    },
};