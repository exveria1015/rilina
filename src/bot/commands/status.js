import config from '../../util/config';
import { buildEmbed } from '../../util/discord';


const statusConfigs = config.get('statuses');

export const name = 'status';

export const optionParser = /(.+)/;

export const shortHelp = '!status [statuscode] - Updates your matchmaking status.';

export const help = `
Usage: \`!status [statuscode]\`

\`statuscode\` = the status you want to set

List of statuses:
\`\`\`
${
  statusConfigs.map(({ code, role, help }) => 
    `${code.padStart(4)} - ${role.padEnd(20)} - ${help}`
  ).join('\n')
}
\`\`\`

Example: \`!status lf\`

Example: \`!status looking for opponent\`

Example: \`!status look\`
`;

export const allowDirectMessage = false;

export const allowChannelMessage = true;

export const run = ({
  client,
  message,
  options: [statusCode]
}) => {
  const {
    author,
    channel,
    member,
    guild
  } = message;

  const statusCodeLetters = statusCode.toUpperCase().replace(/[^A-Z]/g, '');

  const status = statusConfigs.find(x =>
    x.code === statusCode.toUpperCase() 
    ||
    x.role.toUpperCase()
      .replace(/[^A-Z]/g, '')
      .indexOf(statusCodeLetters) === 0
  );

  if (!status) {
    author.send(
      `Sorry, I don't know that status. Type \`!help status\` for help.`
    );
    return;
  }

  const roles = statusConfigs.map(({ role: roleName }) =>
    guild.roles.find(role => role.name === roleName || role.id === roleName)
  );

  const newRole = roles.find(role => role.name === status.role || role.id === status.role);

  const rolesToRemove = member.roles.filter(memberRole =>
    roles.find(statusRole => memberRole.id === statusRole.id)
  );

  member.removeRoles(rolesToRemove)
  .then(() => member.addRole(newRole))
  .then(() => {
    if (status.alert) {
      const message = status.alert
        .replace(/<@([^>]+)>/g, (match, capture) =>
          `<@&${(roles.find(role => role.name === capture) || { id: capture }).id}>`
        )
        .replace(/\{username\}/, `<@${author.id}>`);

      channel.send(message);
    }
  })
  .catch(e => channel.send('Fix Bot Role Permissions'));
};