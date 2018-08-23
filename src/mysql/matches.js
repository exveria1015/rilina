import query from './db';


/**
 * Creates a new match.
 *
 * @param      {String}  timestamp  UNIX timestamp
 * @param      {String}  format  The game format
 * @param      {String}  player1  Player 1's discord ID
 * @param      {Number}  player1wins Number of games won by player 1
 * @param      {String}  player2  Player 2's discord ID
 * @param      {Number}  player2wins Number of games won by player 2
 * @param      {String}  confirmationCode  Random confirmation code
 * @return     {Promise} Resolves if successful.
 */
export const createMatch = ({
  timestamp,
  format,
  player1,
  player1wins,
  player2,
  player2wins,
  winner,
  confirmationCode
}) =>
  query({
    query: `
    INSERT INTO matches
      (timestamp, format, player1, player1wins, player2, player2wins, confirmationcode, confirmed)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, 0)
    ;`,
    values: [timestamp, format, player1, player1wins, player2, player2wins, confirmationCode]
  });

/**
 * Confirms the outcome of a match.
 *
 * @param      {String}  discordId  Player 2's discord ID
 * @param      {Number}  confirmationCode  Random confirmation code
 * @return     {Promise} Resolves if successful.
 */
export const confirmMatch = ({
  discordId,
  confirmationCode
}) =>
  query({
    query: `
    UPDATE matches
    SET
      confirmed = 1
    WHERE
      player2 = ?
      AND
      confirmationcode = ?
      AND
      confirmed = 0
    ;`,
    values: [discordId, confirmationCode]
  });

/**
 * Get an unconfirmed match
 *
 * @param      {String}  discordId  A player's discord ID
 * @param      {Number}  confirmationCode  Random confirmation code
 * @return     {Promise} Resolves if successful.
 */
export const getUnconfirmedMatch = ({
  discordId,
  confirmationCode
}) =>
  query({
    query: `
    SELECT * FROM matches
    WHERE
      (
        player1 = ?
        OR
        player2 = ?
      )
      AND
      confirmationcode = ?
      AND
      confirmed = 0
    ;`,
    values: [discordId, discordId, confirmationCode]
  })
  .then(({ results }) => results[0] || false);

/**
 * Deletes an unconfirmed match
 *
 * @param      {String}  id  The match id
 * @return     {Promise} Resolves if successful.
 */
export const deleteMatch = ({ id }) =>
  query({
    query: `
    DELETE FROM matches
    WHERE id = ?
    ;`,
    values: [id]
  });