const Discord = require('discord.js');
const fs = require('fs');
const { prefix } = require('../config.json');

module.exports = {
    name: 'joinable',
    description: 'Lists joinable roles',
    aliases: ['roles', 'list'],
    usage: '',
    cooldown: 5,
    execute(bot, message, args)
    {
        const data = fs.readFileSync('./roles.json');
        const json = JSON.parse(data);
        if (json.guild.find(element => element.id === message.guild.id) === undefined)
        {
            json.guild.push({ 'id': message.guild.id, 'logchannel': '', 'roles': new Array() });
            fs.writeFileSync('./roles.json', JSON.stringify(json));
            return message.channel.send('There don\'t seem to be any joinable roles.');
        }
        const roles = JSON.parse(data).guild.find(element => element.id === message.guild.id).roles;

        if (roles === undefined || roles.length === 0)
            return message.channel.send('There don\'t seem to be any joinable roles.');

        const embedConstruction = {
            color: '#9D1731',
            title: 'All joinable roles',
            timestamp: new Date(),
            footer:
            {
                icon_url: bot.user.avatarURL(),
                text: '© raymond570#2966',
            },
        };

        let reply = new Discord.MessageEmbed(embedConstruction);

        for (let i = 0; i < roles.length; i++)
        {
            if (i % 21 === 0 && i !== 0)
            {
                message.channel.send(reply);
                reply = new Discord.MessageEmbed(embedConstruction);
            }
            reply.addField(`${roles[i].name}`, `Use \`${prefix}join ${roles[i].value}\``, true);
        }

        message.channel.send(reply)
            .then(msg =>
            {
                if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                {
                    message.delete({ timeout: 15000 });
                    msg.delete({ timeout: 15000 });
                }
            });
    },
};