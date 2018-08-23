import config from '../../util/config';
import { emojifyString } from '../../util';


const name = 'formats';
const optionParser = /^$/;
const shortHelp = '!formats ランクマッチを行える対戦フォーマットの一覧になります。';
const help = `
使用方法はこちらになります。
\`!formats\`\nと入力するだけです！
`;
const allowDirectMessage = true;
const allowChannelMessage = true;

const run = ({
  client,
  message,
  options: []
}) => {
  const { matchFormats } = config.get('rankings');
  const formatted = matchFormats
    .map(({code, name}) => `\`${code}\` - ${name}`)
    .join('\n');

  message.author.send(`
__ランクマッチを行える作品:__

${formatted}
  `);
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