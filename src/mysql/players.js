import query from './db';


/**
 * Update or create a player
 *
 * @param      {Number}  discordId  The discord identifier
 * @param      {String}  name  The player's new nickname
 * @return     {Promise} Resolves if successful.
 */
export const updatePlayer = ({
  discordId,
  name
}) =>
  query({
    query: `
    INSERT INTO players
      (discordid, name)
    VALUES
      (?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name)
    ;`,
    values: [discordId, name]
  });

/**
 * Gets a player by discord ID.
 * 
 * @param      {Number}          discordId  The discord identifier
 * @return     {Promise<Player>} The player or false
 */
export const getPlayerById = ({
  discordId
}) =>
  query({
    query: `
    SELECT * FROM players
    WHERE 
      discordid = ?
    ;`,
    values: [discordId]
  })
  .then(({ results }) => results[0] || false);