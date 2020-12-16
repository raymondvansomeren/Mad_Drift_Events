const fs = require('fs');

module.exports = {
    name: 'addrole',
    description: 'Adds a role as joinable',
    aliases: [''],
    usage: '[rolemention] [rolename (no_spaces)(value to give when joining the role : `e!join rolename`]',
    cooldown: 5,
    execute(bot, message, args)
    {
        if (args.length !== 2)
            return message.channel.send('Please just mention the role you want to add and after that the value you want people to use to join that role (`e@addrole @foo bar`)');

        let role = message.mentions.roles.first();
        if (role === undefined)
            role = message.guild.roles.cache.find(r => r.name === args.shift());
        if (role === undefined)
            return message.channel.send('Could not find that role');


        const data = fs.readFileSync('./roles.json');
        const json = JSON.parse(data);
        console.log('Before:');
        console.log(json.guild.find(element => element.id === message.guild.id).roles);

        json.guild.find(element => element.id === message.guild.id).roles.push({ 'name': role.name, 'id': role.id, 'value': args[1] });
        console.log('After:');
        console.log(json.guild.find(element => element.id === message.guild.id).roles);

        fs.writeFileSync('./roles.json', JSON.stringify(json));
    },
};