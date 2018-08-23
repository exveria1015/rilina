import glicko2 from 'glicko2-lite';
import config from './config';
import {
  createRanking,
  getRanking
} from '../mysql/rankings';

/**
 * Gets match format object by it's code.
 *
 * @param      {String}  formatCode  The format code
 * @return     {Object}  The match format object { code, name }
 */
export const getMatchFormat = (formatCode) => {
  const { matchFormats } = config.get('rankings');
  const bigCode = formatCode.toUpperCase();
  return matchFormats.find(({ code }) => code === bigCode);
};

/**
 * Reads a string in format WWLLWLW and returns the number of wins and losses.
 * OR
 * Reads a string in format #-# and returns wins and losses
 *
 * @param      {string}  str
 * @return     {Object}  Object with format { wins, losses }
 */
export const parseWinLoss = (str) => {
  if (/^[WLwl]+$/.test(str)) {
    const chars = [...str.toUpperCase()];
    const total = chars.length;
    const wins = chars.filter(char => char === 'W').length;
    const losses = total - wins;

    return {
      wins,
      losses,
      total
    };
  } else {
    const [, wins, losses] = str.match(/^(\d+)\-(\d+)$/).map(Number);
    const total = wins + losses;

    return {
      wins,
      losses,
      total
    };
  }
};

/**
 * Calculates a player's new ranking using magical statistics:
 * http://www.glicko.net/glicko/glicko2.pdf
 *
 * @param      {Object}   player    The player's rating object
 * @param      {Object}   opponent  The opponent's rating object
 * @param      {Number}   wins      How many wins
 * @param      {Number}   losses    How many losses
 * @return     {Object}   The ranking { r, rd, vol }
 */
export const calculateRanking = ({
  player,
  opponent,
  wins,
  losses
}) => {
  const {
    r: playerR,
    rd: playerRD,
    vol: playerVol
  } = player;

  const {
    r: opponentR,
    rd: opponentRD
  } = opponent;

  const matches = [
    ...[...Array(wins)].map(() => [opponentR, opponentRD, 1]),
    ...[...Array(losses)].map(() => [opponentR, opponentRD, 0])
  ];

  const {
    rating: r,
    rd,
    vol
  } = glicko2(playerR, playerRD, playerVol, matches);

  return {
    r,
    rd,
    vol
  };
};

/**
 * Gets or creates a new ranking for a player
 *
 * @param      {String}  discordId  The discord identifier
 * @param      {String}  format     The game format
 * @return     {<type>}  The or create ranking.
 */
export const getOrCreateRanking = ({
  discordId, 
  format
}) =>
  getRanking({
    discordId,
    format
  })
  .then((ranking) => {
    if (ranking) {
      return Promise.resolve(ranking);
    }
    
    const { glickoDefaults } = config.get('rankings');
    const {
      r,
      rd,
      vol
    } = glickoDefaults;

    return createRanking({
      format,
      discordId,
      r,
      rd,
      vol
    })
    .then(() => Promise.resolve(glickoDefaults));
  });