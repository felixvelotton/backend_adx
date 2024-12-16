const dotenv = require('dotenv');

dotenv.config();
const {
 PORT,
 pgConnection
} = process.env;

module.exports = {
 port: PORT,
 urlConnection: pgConnection
} 