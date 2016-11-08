'use strict';

const app = require('./app');
const port = app.get('port');
const server = app.listen(port);

server.on('listening', () =>
  console.log(`Feathers server started on ${app.get('host')}:${port}.\nBuilding client with webpack....`)
);