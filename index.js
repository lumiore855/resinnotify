require('dotenv').config();

const { Client, GatewayIntentBits, Events, MessageFlags } = require('discord.js');
const express = require('express');

const GAS_URL = process.env.GAS_URL;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const app = express();

app.get('/', (req, res) => {
  res.send('Bot is alive');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

async function callGAS(payload) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  await interaction.deferReply({
    flags: MessageFlags.Ephemeral
  });

  try {
    let data;

    if (interaction.commandName === 'resin') {
      data = await callGAS({
        type: 'saveResin',
        userId: interaction.user.id,
        userName: interaction.user.username,
        gameId: interaction.options.getString('game'),
        resin: interaction.options.getInteger('value'),
      });
    }

    if (interaction.commandName === 'notify') {
      data = await callGAS({
        type: 'saveNotify',
        userId: interaction.user.id,
        gameId: interaction.options.getString('game'),
        notifyMin: interaction.options.getInteger('minutes'),
      });
    }

    if (interaction.commandName === 'webhook') {
      data = await callGAS({
        type: 'saveWebhook',
        userId: interaction.user.id,
        webhookUrl: interaction.options.getString('url'),
      });
    }

    await interaction.editReply(data.ok ? data.message : `${data.error}`);
  } catch (err) {
    console.error(err);
    await interaction.editReply('サーバー通信に失敗しちゃった。しばらくしてから試してね。');
  }
});

client.login(DISCORD_TOKEN);
