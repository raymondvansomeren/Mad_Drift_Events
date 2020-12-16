const fs = require('fs');

module.exports = {
    name: 'removerole',
    description: 'Removes a role as joinable',
    aliases: [''],
    usage: '[rolemention]',
    cooldown: 5,
    execute(bot, message, args)
    {
        // TODO
        if (args.length !== 1)
            return message.channel.send('Please just mention/name the role you want to remove (`e@removerole @foo` / `e@removerole foo`)');

        let role = message.mentions.roles.first();
        if (role === undefined)
            role = message.guild.roles.cache.find(r => r.name === args[0]);
        if (role === undefined)
            return message.channel.send('Could not find that role');


        const data = fs.readFileSync('./roles.json');
        const json = JSON.parse(data);
        if (json.guild.find(element => element.id === message.guild.id) === undefined)
            json.guild.push({ 'id': message.guild.id, 'roles': new Array() });


        const roles = json.guild.find(element => element.id === message.guild.id).roles;

        const index = json.guild.find(element => element.id === message.guild.id).roles.indexOf(roles.find(element => element.name === role.name || element.value === args[0]));
        if (index > -1)
            json.guild.find(element => element.id === message.guild.id).roles.splice(index, 1);

        fs.writeFileSync('./roles.json', JSON.stringify(json));

        message.channel.send(`Removed ${args[0]} from joinable roles.`);
    },
};