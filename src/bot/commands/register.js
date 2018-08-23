import { buildEmbed } from '../../util/discord';
import { updatePlayer } from '../../mysql/players';


const name = 'register';
const optionParser = /^$/;
const shortHelp = '!register - レーティングマッチにユーザー情報の登録/更新を行います';
const help = `
使い方: \`!register\`
`;
const allowDirectMessage = false;
const allowChannelMessage = true;

const run = ({
  client,
  message,
  options
}) => {
  const {
    author,
    channel
  } = message;
  const {
    id: discordId,
    username: name
  } = author;

  // TODO: Enable guild nickname for use as player name

  updatePlayer({
    discordId,
    name
  })
  .then(() =>
    channel.send(
      buildEmbed(client, {
        title: `レーティングマッチへようこそ！簡単なマニュアルをDMに送りますね`,
        description: `登録者: <@${discordId}>`
      })
    )
  )
  .catch(console.error);
};

export default {
  name,
  optionParser,
  shortHelp,
  help,
  allowDirectMessage,
  allowChannelMessage,
  run
};