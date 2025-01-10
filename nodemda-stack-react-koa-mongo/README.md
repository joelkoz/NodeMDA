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



## Composition

This stack is built using the following NodeMDA plugins:

- [js-mongoose](https://github.com/joelkoz/NodeMDA/nodemda-js-mongoose/README.md)
- [js-rest-koa](https://github.com/joelkoz/NodeMDA/nodemda-js-mongoose/README.md)
- [js-react-mantine](https://github.com/joelkoz/NodeMDA/nodemda-js-mongoose/README.md)
- [js-docker](https://github.com/joelkoz/NodeMDA/nodemda-js-mongoose/README.md)
- [standards](https://github.com/joelkoz/NodeMDA/nodemda-js-mongoose/README.md)

---
### Do you find my work useful?

<a href="https://www.buymeacoffee.com/joelkoz" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
---
