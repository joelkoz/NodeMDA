module.exports = {
	type: 'templates',
	name: 'js-rest-koa',
	desc: 'Generates REST interface to access persistent Javascript objects exposed with EntityDaoJS',
	version: 2.0,
	contributes: [ "REST", "Js-REST-Koa", "NodeJS-Backend" ],
	requires: [	"EntityDaoJS", "NodeMDA-Standards" ]
};
