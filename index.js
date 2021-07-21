const Discord = require('discord.js');
const fs = require('fs');

const { token, prefix, modPrefix } = require('./config.json');

const intents = new Discord.Intents([
    Discord.Intents.NON_PRIVILEGED,
    'GUILD_MEMBERS',
]);

const bot = new Discord.Client({ ws: { intents } });
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
                return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 5000 });
                            msg.delete({ timeout: 5000 });
                        }
                    });
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
            message.reply('there was an error trying to execute that command!')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
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
                return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
                    .then(msg =>
                    {
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        {
                            message.delete({ timeout: 5000 });
                            msg.delete({ timeout: 5000 });
                        }
                    });
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
            message.reply('there was an error trying to execute that command!')
                .then(msg =>
                {
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                    {
                        message.delete({ timeout: 5000 });
                        msg.delete({ timeout: 5000 });
                    }
                });
        }
    }
});

bot.on('guildMemberAdd', function()
{
    bot.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} people`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });
});
bot.on('guildMemberRemove', function()
{
    bot.user.setPresence({
        status: 'online',
        activity: {
            name: `over ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} people`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });
});

bot.once('ready', () =>
{
    //DELETE COMMANDS
    /*
    bot.api.applications(bot.user.id).commands.get()
    .then(cmds =>
        {
            cmds.forEach(cmd =>
                {
                    console.log(cmd);
                    bot.api.applications(bot.user.id).commands(cmd.id).delete()
                })
        });
    bot.api.applications(bot.user.id).guilds('555749267667550251').commands.get()
    .then(cmds =>
        {
            cmds.forEach(cmd =>
                {
                    console.log(cmd);
                    bot.api.applications(bot.user.id).guilds('555749267667550251').commands(cmd.id).delete()
                })
        });
    */
    
    // /ECHO COMMAND
    /*
    bot.api.applications(bot.user.id).guilds('555749267667550251').commands.post({
        data: {
            name: 'echo',
            description: 'Echos your text as an embed!',

            options: [
                {
                    name: 'title',
                    description: 'Title of the embed',
                    type: 3,
                    required: true,
                },
                {
                    name: 'content',
                    description: 'Content of the embed',
                    type: 3,
                    required: true,
                },
            ],
        },
    });
    // /CHAT COMMAND
    bot.api.applications(bot.user.id).guilds('555749267667550251').commands.post({
        data: {
            name: 'chat',
            description: 'Chat with embeds!',

            options: [
                {
                    name: 'message',
                    description: 'Your message',
                    type: 3,
                    required: true,
                },
            ],
        },
    });
    
    bot.ws.on('INTERACTION_CREATE', async (interaction) =>
    {
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        // /ECHO COMMAND
        if(command === 'echo') {
            const title = args.find(arg => arg.name.toLowerCase() == 'title').value;
            const description = args.find(arg => arg.name.toLowerCase() == 'content').value;
            const embed = new Discord.MessageEmbed()
                .setTitle(title)
                .setColor('RANDOM')
                .setDescription(description);
            
            const userPerms = new Discord.Permissions(Number(interaction.member.permissions));

            if (userPerms.has('ADMINISTRATOR'))
            {
                bot.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 3,
                        data: await createAPIMessage(interaction, embed)
                    }
                });
            }
            else
            {
                bot.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 3,
                        data: 
                        {
                            content: 'You can\'t use this command',
                            flags: 1 << 6
                        },
                    }
                });
            }
        }
        
        if(command === 'chat') {
            const description = args.find(arg => arg.name.toLowerCase() == 'message').value;
            const embed = new Discord.MessageEmbed()
                .setColor('RANDOM')
                .setDescription(description)
                .setThumbnail('https://cdn.discordapp.com/avatars/' + interaction.member.user.id + '/' + interaction.member.user.avatar + '.png')
                .setFooter(interaction.member.user.username + '#' + interaction.member.user.discriminator, 'https://cdn.discordapp.com/avatars/' + interaction.member.user.id + '/' + interaction.member.user.avatar + '.png');
            let nickname = '';
            if (interaction.member.nick !== null)
            {
                nickname = interaction.member.nick;
            }
            else
            {
                nickname = interaction.member.user.username;
            }
            embed.setTitle(nickname);
                
            const embed2 = new Discord.MessageEmbed()
                .setDescription(description)
                .setTitle('Author: ' + interaction.member.user.username + '#' + interaction.member.user.discriminator + ' / ' + nickname)
                .setThumbnail('https://cdn.discordapp.com/avatars/' + interaction.member.user.id + '/' + interaction.member.user.avatar + '.png');
            bot.channels.cache.get('814636409125470208').send(embed2);
            
            bot.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 3,
                    data: await createAPIMessage(interaction, embed)
                }
            });
        }
    });
    */

    now = new Date();
    console.log(now.toUTCString(), ': Ready!');

    bot.user.setPresence({
        status: 'dnd',
        activity: {
            name: `over ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} people`,
            // PLAYING: WATCHING: LISTENING: STREAMING:
            type: 'WATCHING',
        },
    });
});

async function createAPIMessage(interaction, content) {
    const apiMessage = await Discord.APIMessage.create(bot.channels.resolve(interaction.channel_id), content)
        .resolveData()
        .resolveFiles();
    
    return { ...apiMessage.data, files: apiMessage.files };
}

bot.login(token);