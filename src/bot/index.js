import Discord from 'discord.js';
import createCommandParser from './commandParser';
import config from '../util/config';

const { apiToken } = config.get('bot');

const client = new Discord.Client();

client.on('ready', () => {
  console.log('Bot is running.');
  client.channels.get('481199197081567246').sendMessage('戦績管理システム”リリナ”起動しました。\nこれより、対象となるマッチングを監視、記録しますね！');
  });

client.on('message', createCommandParser(client));
client.login(apiToken);