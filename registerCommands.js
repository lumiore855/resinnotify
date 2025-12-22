require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const webhook = new SlashCommandBuilder()
  .setName('webhook')
  .setDescription('通知用webhookを登録します')
  .addStringOption(opt =>
    opt.setName('url').setDescription('webhookのURL').setRequired(true)
  );

const notify = new SlashCommandBuilder()
  .setName('notify')
  .setDescription('何分前に通知するかを設定します')
  .addStringOption(opt =>
    opt
      .setName('game')
      .setDescription('ゲームID')
      .setRequired(true)
      .addChoices(
        { name: '原神', value: 'g' },
        { name: 'スターレイル', value: 'h' },
        { name: '鳴潮', value: 'w' },
        { name: 'ゼンゼロ', value: 'z' },
      )
  )
  .addIntegerOption(opt =>
    opt.setName('minutes').setDescription('何分前に通知するか').setRequired(true)
  );

const resin = new SlashCommandBuilder()
  .setName('resin')
  .setDescription('現在の樹脂を登録します')
  .addStringOption(opt =>
    opt
      .setName('game')
      .setDescription('ゲームID')
      .setRequired(true)
      .addChoices(
        { name: '原神', value: 'g' },
        { name: 'スターレイル', value: 'h' },
        { name: '鳴潮', value: 'w' },
        { name: 'ゼンゼロ', value: 'z' },
      )
  )
  .addIntegerOption(opt =>
    opt.setName('value').setDescription('現在の樹脂').setRequired(true)
  );

const commands = [resin, notify, webhook];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log('✅ Slash commands registered');
  } catch (err) {
    console.error(err);
  }
})();
