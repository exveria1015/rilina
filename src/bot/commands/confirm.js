import { buildEmbed } from '../../util/discord';
import {
  confirmMatch,
  getUnconfirmedMatch
} from '../../mysql/matches';
import {
  updateRanking
} from '../../mysql/rankings';
import {
  calculateRanking,
  getMatchFormat,
  getOrCreateRanking
} from '../../util/rankings';


const name = 'confirm';
const optionParser = /(\d{6})/i;
const shortHelp = '!confirm [code] - 報告された対戦結果の記録を承認します。';
const help = `
: \`!confirm [code]\`

\`code\` = 6桁のマッチングコードになります。結果報告をすると自動的に発行されます。

例: \`!confirm 123456\`
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

    if (match.player1 === discordId) {
      author.send(
        `試合結果はちゃんと相手に確認しましたか～？ズルはしたらだめですからね！`
      );
    }

    // Update rankings

    const {
      id,
      format,
      player1: playerOneId,
      player1wins,
      player2: playerTwoId,
      player2wins
    } = match;

    return Promise.all([
      getOrCreateRanking({
        discordId: playerOneId,
        format
      }),
      getOrCreateRanking({
        discordId: playerTwoId,
        format
      })
    ])
    .then(([playerOneRank, playerTwoRank]) => {
      const playerOneNewRank = calculateRanking({
        player: playerOneRank, 
        opponent: playerTwoRank,
        wins: player1wins,
        losses: player2wins
      });
      const playerTwoNewRank = calculateRanking({
        player: playerTwoRank, 
        opponent: playerOneRank,
        wins: player2wins,
        losses: player1wins
      });

      return Promise.all([
        updateRanking({
          discordId: playerOneId,
          format,
          r: playerOneNewRank.r,
          rd: playerOneNewRank.rd,
          vol: playerOneNewRank.vol
        }),
        updateRanking({
          discordId: playerTwoId,
          format,
          r: playerTwoNewRank.r,
          rd: playerTwoNewRank.rd,
          vol: playerTwoNewRank.vol
        })
      ])
      .then((res) => Promise.resolve({
        match,
        playerOneRating: Math.round(playerOneNewRank.r),
        playerTwoRating: Math.round(playerTwoNewRank.r)
      }));
    });
  })
  // Confirm match
  .then((result) => {
    if (!result) {
      return;
    }

    return confirmMatch({
      discordId,
      confirmationCode
    })
    .then((res) => Promise.resolve(result));
  })
  // Send chat message
  .then((result) => {
    if (!result) {
      return;
    }

    const {
      match,
      playerOneRating,
      playerTwoRating
    } = result;

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

    return channel.send(
      buildEmbed(client, {
        title: `試合結果を承認しました！ (${confirmationCode})`,
        description: `
<@${playerOneId}> **(${player1wins})** - **(${player2wins})** <@${playerTwoId}>

**対戦作品:** ${formatName} (\`${formatCode}\`)

 <@${playerOneId}> の${formatCode}でのレートが更新されました: **${playerOneRating}**

 <@${playerTwoId}> の${formatCode}でのレートが更新されました: **${playerTwoRating}** 
`
      })
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