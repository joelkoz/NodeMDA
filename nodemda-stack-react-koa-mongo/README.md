# NodeMDA stack-react-koa-mongo

## Introduction

NodeMDA `stack-react-koa-mongo` is a plugin for the [NodeMDA](https://github.com/joelkoz/NodeMDA) code generation engine. 
It generates a full application stack with the following features:

- **Backend**
   - NodeJS application written in pure Javascript
   - peristent entities using the [MongooseJS](https://mongoosejs.com) framework to access a [MongoDB](https://www.mongodb.com) database.
   - REST interface to peristent entities that uses the [Koa](https://koajs.com) framework.

- **Frontend**
   - web based user interface that supplies CRUD editing of peristent entities
   - UI is a pure Javascript application using the [React](https://react.dev) framework
   - [Mantine UI](https://ui.mantine.dev) components


- Docker files available for deployment


## Installation

Install this plugin globally so it can be seen from all of your projects.

**_Command line_**
```

## The core NodeMDA system (if you have not already installed it)
npm install -g nodemda
npm install -g nodemda-nodeuml

## Install this software stack plugin
npm install -g nodemda-stack-react-koa-mongo
```

## Composition

This stack is built using the following NodeMDA plugins:

- [js-mongoose](https://github.com/joelkoz/NodeMDA/tree/master/nodemda-js-mongoose)
- [js-rest-koa](https://github.com/joelkoz/NodeMDA/tree/master/nodemda-js-rest-koa)
- [js-react-mantine](https://github.com/joelkoz/NodeMDA/tree/master/nodemda-js-react-mantine)
- [js-docker](https://github.com/joelkoz/NodeMDA/tree/master/nodemda-js-docker)
- [standards](https://github.com/joelkoz/NodeMDA/tree/master/nodemda-standards)
---
### Do you find my work useful?

<a href="https://www.buymeacoffee.com/joelkoz" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
---
