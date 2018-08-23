import config from './config';

export const buildEmbed = (client, options) => {
  const { embedColor: color } = config.get('bot');
  const { avatarURL: icon_url } = client.user;
  const timestamp = new Date();

  return ({
    embed: Object.assign({
      color,
      author: {
        name: 'リリナ',
        icon_url
      },
      timestamp
    }, options)
  });
};