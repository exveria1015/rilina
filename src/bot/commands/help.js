import { getCommands } from './index';


export const name = 'help';

export const optionParser = /(\w*)/;

export const shortHelp = '!help [command] - コマンドの詳細を確認できます';

export const help = `
使い方: \`!help [コマンド]\`

\`command\` = 詳細な説明をしてほしいコマンドを入力してくださいね.

例: \`!help record\`
`;

export const allowDirectMessage = true;

export const allowChannelMessage = true;

export const run = ({
  client,
  message,
  options: [commandName]
}) => {
  const { author } = message;
  const commands = getCommands();

  if (!commandName) {
    const shortHelps = commands.map(command => command.shortHelp);

    message.author.send(`\`\`\`
${shortHelps.join('\n')}
\`\`\``);
  } else {
    const command = commands.find(cmd => cmd.name === commandName);

    if (command) {
      author.send(command.help);
    } else {
      author.send(`Command ${commandName} does not exist.`);
    }
  }
};