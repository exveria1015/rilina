import query from './db';


/**
 * Creates a player ranking
 *
 * @param      {Number}  discordId  The discord identifier
 * @param      {String}  format  The game format
 * @param      {Number}  r  Rating
 * @param      {Number}  rd  Rating Deviation
 * @param      {Number}  vol  Volatility
 * @return     {Promise} Resolves if successful.
 */
export const createRanking = ({
  discordId,
  format,
  r,
  rd,
  vol
}) =>
  query({
    query: `
    INSERT INTO rankings
      (discordid, format, r, rd, vol)
    VALUES
      (?, ?, ?, ?, ?)
    ;`,
    values: [discordId, format, r, rd, vol]
  });

/**
 * Update a player ranking
 *
 * @param      {String}  discordId  The discord identifier
 * @param      {String}  format  The game format
 * @param      {Number}  r  Rating
 * @param      {Number}  rd  Rating Deviation
 * @param      {Number}  vol  Volatility
 * @return     {Promise} Resolves if successful.
 */
export const updateRanking = ({
  discordId,
  format,
  r,
  rd,
  vol
}) =>
  query({
    query: `
    UPDATE rankings
    SET
      r = ?,
      rd = ?,
      vol = ?
    WHERE
      discordid = ?
      AND
      format = ?
    ;`,
    values: [r, rd, vol, discordId, format]
  });

/**
 * Get a player's ranking in a format
 *
 * @param      {Number}          discordId  The discord identifier
 * @param      {String}          format  The game format
 * @return     {Promise<Object>} The player's ranking or false.
 */
export const getRanking = ({
  discordId,
  format
}) =>
  query({
    query: `
    SELECT * FROM rankings
    WHERE
      discordId = ?
      AND
      format = ?
    ;`,
    values: [discordId, format]
  })
  .then(({ results }) => results[0] || false);