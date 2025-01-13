module.exports = {
	type: 'templates',
	name: 'js-docker',
	desc: 'Create Dockerfiles for NodeJS frontends and backends',
	version: 2.0,
	contributes: [ "Docker", "Js-Docker" ],
	requires: [ "WebApp-Frontend", "NodeJS-Backend", "MongoDB" ]
};
