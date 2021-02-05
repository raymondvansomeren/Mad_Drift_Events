module.exports = {
    name: 'ping',
    description: 'Pong?',
    aliases: [''],
    usage: '',
    cooldown: 5,
    execute(bot, message, args)
    {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        const t = new Date();
        message.channel.send('Ping?')
            .then(messages =>
            {
                const tt = new Date();
                const ping = tt - t;
                messages.edit(`Pong! Latency is ${ping} ms`);
            })
            .then(msg =>
            {
                if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                {
                    message.delete({ timeout: 10000 });
                    msg.delete({ timeout: 10000 });
                }
            });
    },
};