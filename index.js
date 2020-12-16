const Discord = require('discord.js');
const fs = require('fs');

const { token, prefix, modPrefix } = require('./config.json');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
bot.modCommands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const modCooldowns = new Discord.Collection();

let now = new Date();

// Default (everyone) commands
fs.readdir('./commands/', (err, files) =>
{
    if (err)
    {
        now = new Date();
        console.log(now.toUTCString(), ':', err);
    }
    now = new Date();
    console.log(now.toUTCString(), ': Loading default commands.');

    const jsfile = files.filter(f => f.split('.').pop() === 'js');

    if (jsfile.length <= 0)
    {
        now = new Date();
        console.log(now.toUTCString(), ': Couldn\'t find commands.');
        return;
    }

    jsfile.forEach((f, i) =>
    {
        const props = require(`./commands/${f}`);
        now = new Date();
        console.log(now.toUTCString(), `: ${f} loaded!`);
        bot.commands.set(props.name, props);
    });
});

// Moderation commands
fs.readdir('./modCommands/', (err, files) =>
{
    if (err)
    {
        now = new Date();
        return console.error(now.toUTCString(), ':', err);
    }
    now = new Date();
    console.log(now.toUTCString(), ': Loading moderation commands.');

    const jsfile = files.filter(f => f.split('.').pop() === 'js');

    if (jsfile.length <= 0)
    {
        now = new Date();
        console.log(now.toUTCString(), ': Couldn\'t find modCommands.');
        return;
    }

    jsfile.forEach((f, i) =>
    {
        const props = require(`./modCommands/${f}`);
        now = new Date();
        console.log(now.toUTCString(), `: ${f} loaded!`);
        bot.modCommands.set(props.name, props);
    });
});

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

bot.on('message', async message =>
{
    if (message.author.bot || message.channel.type === 'dm')
        return;

    const prefixRegex = new RegExp(`^(<@!?${bot.user.id}>|${escapeRegex(prefix)}|${escapeRegex(modPrefix)})\\s*`);

    if (!prefixRegex.test(message.content.toLowerCase()))
        return;


    const [, matchedPrefix] = message.content.toLowerCase().match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (message.content.toLowerCase().startsWith(modPrefix))
    {
        const command = bot.modCommands.get(commandName)
            || bot.modCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command)
            return;

        // Check/set cooldown
        if (!modCooldowns.has(command.name))
            modCooldowns.set(command.name, new Discord.Collection());

        now = Date.now();
        const timestamps = modCooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id))
        {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime)
            {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            }
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try
        {
            command.execute(bot, message, args);
        }
        catch (e)
        {
            now = new Date();
            console.error(now.toUTCString(), ':', e);
            message.reply('there was an error trying to execute that command!');
        }
    }
    else
    {
        const command = bot.commands.get(commandName)
            || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command)
            return;

        // Check/set cooldown
        if (!cooldowns.has(command.name))
            cooldowns.set(command.name, new Discord.Collection());

        now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id))
        {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime)
            {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            }
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try
        {
            command.execute(bot, message, args);
        }
        catch (e)
        {
            now = new Date();
            console.error(now.toUTCString(), ':', e);
            message.reply('there was an error trying to execute that command!');
        }
    }
});

bot.once('ready', () =>
{

    now = new Date();
    console.log(now.toUTCString(), ': Ready!');

    bot.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} people`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });
});

bot.login(token);