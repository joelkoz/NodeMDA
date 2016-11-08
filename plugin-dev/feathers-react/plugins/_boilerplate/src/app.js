'use strict';

// Add the project root directory to the module search path---------
const path = require('path');
process.env.NODE_PATH = path.resolve(__dirname, '..');
// Re-compute paths to add our NODE_PATH env variable to the search paths
require('module').Module._initPaths();
// ------------------------------------------------------------

require('omni-schema/lib/plugins/db-mongoosejs').plugin();
require('omni-schema/lib/plugins/validation-joi').plugin();

const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const services = require('./services');
const isDev = require('isdev');
const config = require('../webpack.config.js');
const historyApiFallback = require('connect-history-api-fallback');
const app = feathers();
const winston = require('winston');


var isTest = typeof global.it === 'function';

if (isDev && !isTest) {
  winston.level = 'debug';

  winston.info('Configuring webpack for development hot loading...');
  const webpack = require('webpack');

  const compiler = webpack(config);

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath,
  }));

  app.use(require('webpack-hot-middleware')(compiler));
}
else {
  winston.level = 'warn';
}

app.configure(configuration(path.join(__dirname, '..')));

// Rewrite all GET requests for text/html to the index to support 
// React router history
app.use(historyApiFallback({ index: '/index.html' }));

app.use(compress())
  .options('*', cors())
  .use(cors())
  .use(favicon( path.join(app.get('public'), 'favicon.ico') ))
  .use('/', serveStatic( app.get('public') ))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(socketio())
  .configure(services)
  .configure(middleware);

module.exports = app;
