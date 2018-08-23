import { emojifyString } from '../../util';

const name = 'big';
const optionParser = /(.+)/;
const shortHelp = '!big [text] - Converts text into big emoji characters';
const help = `
Usage: \`!big [text]\`

\`text\` = the text to be converted.

Example: \`!big hello world\`
`;
const allowDirectMessage = true;
const allowChannelMessage = true;

const run = ({
  client,
  message,
  options: [text]
}) => {
  const { id } = message.author;
  const response = emojifyString(text);
  message.channel.send(`<@${id}>:

${response}`);
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