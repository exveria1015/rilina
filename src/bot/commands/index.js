import config from '../../util/config';

 import big from './big';
 import confirm from './confirm';
 import decline from './decline';
 import formats from './formats';
import * as help from './help';
 import record from './record';
 import register from './register';
import * as status from './status';


const {
  commandShortcuts,
  disabledCommands,
  prefix
} = config.get('bot');

const core = [
  big,
  confirm,
  decline,
  formats,
  help,
  record,
  register,
  status,
].filter(({ name }) => !disabledCommands.includes(name));

const shortcuts = commandShortcuts
  .filter(({ command: [name] }) => !disabledCommands.includes(name))
  .reduce((accumulator, { command, shortcuts, help }) =>
    accumulator.concat(
      shortcuts.map(shortcut => ({
        shortcut,
        command,
        help
      }))
    ), [])
  .map(({
    shortcut, 
    command: [name, option = ''], 
    help: helpText
  }) => {
    const {
      allowDirectMessage,
      allowChannelMessage,
      help: cmdHelp,
      run: cmdRun
    } = core.find(x => x.name === name);

    const shortHelp = `${prefix}${shortcut} - ${helpText} (shortcut for ${prefix}${name} ${option})`;

    const help = `**This is a shortcut for \`${prefix}${name} ${option}\`**
    
${cmdHelp}`;
    
    const run = (args) =>
      cmdRun({
        ...args,
        options: [option]
      });

    return {
      name: shortcut,
      optionParser: /^$/,
      shortHelp,
      help,
      allowDirectMessage,
      allowChannelMessage,
      run
    };
  });

export const commands = core.concat(shortcuts)
  .sort(({ name: nameA }, { name: nameB }) => 
    nameA > nameB ? 1 : nameB > nameA ? -1 : 0
  );

// workaround for circular reference issue
export const getCommands = () => commands;