import { buildEmbed } from '../../util/discord';
import { createMatch } from '../../mysql/matches';
import { getPlayerById } from '../../mysql/players';
import {
  getMatchFormat,
  parseWinLoss
} from '../../util/rankings';
import { randomCode } from '../../util';
import moment from 'moment';


const name = 'record';
const optionParser = /(\w+)\s+([WLwl]{1,10}|\d+\-\d+)\s+/i;
const shortHelp = '!record [format] [wins/losses] [@対戦相手] - ランクマッチの結果を記録します';
const help = `
使い方: \`!record [format] [wins/losses] [@対戦相手]\`

\`format\`       = 対戦した作品を入力してください 禁書VOであれば\`VOINDEX\`を入れてください。
				   また\`!format\`を実行することで対戦形式の詳細を参照できますよ
				   \`VOINDEX\`\`VOOT\`\`VOOMG\`
\`wins/losses\`  =  勝敗を入力してください。 また連続で戦った際に
				   \`WWLW\` (W = 勝ち) (L = 負け) と書くことも出来ます
				   その他に\`4-6\`というような書式も使用できますので使いやすい方を選んでください
				   \`一度に記録できる試合数は10です\`
\`@対戦相手\`    = 対戦した相手のユーザー名を入れます。

例: 
Player2さんと禁書VOで8回試合を行い ｛勝ち 勝ち 勝ち 勝ち 負け 勝ち 負け 勝ち｝ となった場合のコマンドは
\`!record VOINDEX WWWWLWLW @Plyaer2\` または
\`!record VOINDEX 6-2 @Plyaer2\` となります。

`;
const allowDirectMessage = false;
const allowChannelMessage = true;

const run = ({
  client,
  message,
  options: [format, winLossString]
}) => {
  const {
    author,
    channel,
    mentions
  } = message;
  const {
    id: playerOneId,
    username: playerOneName
  } = author;

  // Get player two's ID from mentions
  const mentionArray = mentions && mentions.users && mentions.users.array();

  if (!mentionArray || mentionArray.length !== 1) {
    author.send(
      `Invalid use of record. No opponent mentioned or too many opponents mentioned.`
    );
    return;
  }

  const [playerTwo] = mentionArray;
  const {
    id: playerTwoId,
    username: playerTwoName
  } = playerTwo;

  // Check that players don't match
  // if (playerOneId === playerTwoId) {
  //   author.send(
  //     `You can't play a match against yourself! :stuck_out_tongue:`
  //   );
  //   return;
  // }

  // Check that format is valid
  const formatObject = getMatchFormat(format);

  if (!formatObject) {
    author.send(
      `Invalid use of record. Match format ${format} doesn't exist.
Check \`!formats\`.`
    );
    return;
  }

  const {
    code: formatCode,
    name: formatName
  } = formatObject;

  const {
    wins,
    losses,
    total
  } = parseWinLoss(winLossString);

  if (total === 0) {
    author.send(
      `Invalid use of record. You can't record 0 games.`
    );
    return;
  }

  if (total > 10) {
    author.send(
      `Invalid use of record. You can't record more than 10 games at once.`
    );
    return;
  }

  if (isNaN(wins) || isNaN(losses) || isNaN(total)) {
    author.send(
      `Something went horribly wrong. :(`
    );
    return;
  }

  const confirmationCode = randomCode(6);

  // Check that both players are registered
  Promise.all([
    getPlayerById({ discordId: playerOneId }),
    getPlayerById({ discordId: playerTwoId })
  ])
  .then(([playerOne, playerTwo]) => {
    if (!playerOne) {
      author.send(
        `You are not currently registered for ranked play.
Use \`!register\` first.`
      );
      return false;
    }

    if (!playerTwo) {
      author.send(
        `Your opponent is not registered for ranked play.
Tell them to use \`!register\` first.`
      );
      return false;
    }

    // Create a new match
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    
    return createMatch({
      timestamp,
      format: formatCode,
      player1: playerOneId,
      player1wins: wins,
      player2: playerTwoId,
      player2wins: losses,
      confirmationCode
    })
  })
  // Send chat message
  .then(() => {
    const icon_url = client.user.avatarURL;
	
	author.send(
		`対戦結果の承認依頼が届いてますよ～ 合わせて、簡単なコピー用のコマンド送りますね！`
      );
	  
	author.send(
`<@${playerOneId}> **(${wins})** - **(${losses})** <@${playerTwoId}> 
**対戦作品:** ${formatName}`
    );
		 
	author.send(
		`!confirm ${confirmationCode}`
      );
	 author.send(
		`!decline ${confirmationCode}`
      );
	  
    return channel.send(
      buildEmbed(client, {
        title: '新しい試合結果みたいですよ～！',
        description: `
<@${playerOneId}> **(${wins})** - **(${losses})** <@${playerTwoId}> 

**対戦作品:** ${formatName}

<@${playerTwoId}> 試合結果が正しければ \`!confirm ${confirmationCode}\` と入力して試合結果を承認してくださいね。\n もしも間違っている場合は\`!decline ${confirmationCode}\` を入力してくださいね。

 \`!confirm ${confirmationCode}\` 
 
 \`!decline ${confirmationCode}\`
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