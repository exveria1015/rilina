import { buildEmbed } from '../../util/discord';
import {
  deleteMatch,
  getUnconfirmedMatch
} from '../../mysql/matches';
import { getMatchFormat } from '../../util/rankings';


const name = 'decline';
const optionParser = /(\d{6})/i;
const shortHelp = '!decline [code] - 報告された対戦結果の記録を中止します。';
const help = `
使い方: \`!decline [code]\`

\`code\` = 6桁のマッチングコードになります。結果報告をすると自動的に発行されます。

例: \`!decline 123456\`
`;
const allowDirectMessage = false;
const allowChannelMessage = true;

const run = ({
  client,
  message,
  options: [confirmationCode]
}) => {
  const {
    author,
    channel
  } = message;
  const {
    id: discordId,
    username: playerName
  } = author;

  // Find the unconfirmed match
  getUnconfirmedMatch({
    discordId,
    confirmationCode
  })
  .then((match) => {
    if (!match) {
      author.send(
        `この試合 ${confirmationCode} は見つかりませんね～？すでに報告してるかもしれないですよ～？`
      );
      return false;
    }
    return match;
  })
  // Delete match
  .then((match) => {
    if (!match) {
      return;
    }

    const {
      id,
      format,
      player1: playerOneId,
      player1wins,
      player2: playerTwoId,
      player2wins
    } = match;

    const {
      code: formatCode,
      name: formatName
    } = getMatchFormat(format);

    return deleteMatch({ id })
      // Send success chat message
      .then(() =>
        channel.send(
          buildEmbed(client, {
            title: `試合結果の報告をキャンセルしました。 (${confirmationCode})`,
            description: `
~~<@${playerOneId}> **(${player1wins})** - **(${player2wins})** <@${playerTwoId}>~~

**対戦作品:** ${formatName}

キャンセルした人 **${playerName}**
`
          })
        )
      );
  })
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