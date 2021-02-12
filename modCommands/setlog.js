const fs = require('fs');

module.exports = {
    name: 'setlog',
    description: 'Sets a channel to be used to log used commands.',
    aliases: ['log', 'setlogging', 'logchannel'],
    usage: '[channel (leave empty to remove log channel)]',
    cooldown: 5,
    execute(bot, message, args)
    {
        if (!message.member.hasPermission('MANAGE_MESSAGES') || !message.member.hasPermission('MANAGE_CHANNELS'))
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

        let channelID = '0';
        if (args.length > 0)
            channelID = args[0].replace(/\D/g, '');

        const data = fs.readFileSync('./roles.json');
        const json = JSON.parse(data);
        if (json.guild.find(element => element.id === message.guild.id) === undefined)
        {
            if (args.length > 0)
                json.guild.push({ 'id': message.guild.id, 'logchannel': channelID, 'roles': new Array() });
            else
                json.guild.push({ 'id': message.guild.id, 'logchannel': '', 'roles': new Array() });

            fs.writeFileSync('./roles.json', JSON.stringify(json));
        }
        if (args.length > 0)
            json.guild.find(element => element.id === message.guild.id).logchannel = channelID;
        else
            json.guild.find(element => element.id === message.guild.id).logchannel = '';

        fs.writeFileSync('./roles.json', JSON.stringify(json));

        // Log
        const logChannel = JSON.parse(data).guild.find(element => element.id === message.guild.id).logchannel;
        if (logChannel !== undefined && logChannel !== '')
        {
            const channel = bot.channels.cache.get(logChannel);
            channel.send(`${message.author}: ${message.content}`);
        }

        if (args.length > 0)
        {
            message.channel.send(`Set ${args[0]} as the logging channel.`)
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
            message.channel.send('Removed the logging channel.')
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