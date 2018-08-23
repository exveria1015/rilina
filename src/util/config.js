import nconf from 'nconf';
import path from 'path';

nconf.env([
  'NODE_ENV'
]);

const NODE_ENV = nconf.get('NODE_ENV');
const configFile = path.resolve(`./config/${NODE_ENV}.config.json`);

nconf.file(configFile);

export default nconf;