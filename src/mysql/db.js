import mysql from 'mysql';
import { promisify } from 'util';
import config from '../util/config';


const {
  host,
  port,
  user,
  password,
  database
} = config.get('mysql');

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 5
});

/**
 * Performs a promisified MySQL query in the connection pool.
 *
 * @param      {Object}  options  The options object for connection.query
 * @return     {Promise<Object>}  Promise returning { results, fields }
 */
const query = options =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        connection && connection.release();
        reject({ error, options });
        return;
      }

      const {
        query = '',
        values = []
      } = options;

      connection.query(query, values, (error, results, fields) => {
        if (error) {
          connection.release();
          reject({ error, options });
          return;
        }

        connection.release();
        resolve({
          results,
          fields
        });
      });
    })
  });

export default query;