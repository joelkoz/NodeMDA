NodeMDA.js
==========

*NOTE: This README covers the NodeMDA code generation engine and associated plugins.

For a free, open source, and completely integrated UML diagram creation tool with NodeMDA integrated, see the [NodeUML VSCode Extension](https://github.com/joelkoz/NodeUML)



Introduction
------------

NodeMDA is a node.js library used for generating software source code for any project or language using a 
simplified version of the *Model Driven Architecture* methodology. By using a small subset of UML - 
*Class definitions and diagrams* - large sections of your application can be generated automatically. It
is particularly effective for the generation of backend artifacts like database entities and 
remote service interfaces.

NodeMDA is a code generation *_engine_* that uses "plugin" architecture driven
by [Handlebars templates](http://handlebarsjs.com/), allowing you to easily modify 
the code generator results to fit your needs.
While the NodeMDA engine and its plugins are written in Javascript and is executed
by Node.js, the resulting code does NOT need to be Javascript.  In fact, plugins can be created to generate artifacts for
any language or software stack.

NodeMDA focuses on generating code from UML *Class Diagrams*.  From this one diagram type, 
NodeMDA can create virtually all of the boilerplate code to get a 
backend system up and running, including database creation and client service interfaces. 


Sub-projects in this repository
-------------------------------

See these sub-projects for complete documentation on the various components available to you.
If you are not interest in writing your own code generation plugins and instead want to use NodeMDA to generate a complete NodeJS application stack using Koa, Mongoose, and MongoDB for the back end and React + Mantine for the front end, all
deployable using Docker, see the README in the "Full stack code set" below.

- [NodeMDA code generation engine](./nodemda)
- [Model reader for NodeUML files](./nodemda-nodeuml)
- [Model reader for StarUML files](./nodemda-staruml)
- [Full stack code set for React, Koa, and MongoDB](./nodemda-koa-react)
