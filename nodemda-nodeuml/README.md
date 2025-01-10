# NodeUML Reader

## Introduction

This package defines a "reader" object for [NodeMDA](https://github.com/joelkoz/NodeMDA).  It reads the data file of the [NodeUML diagraming tool](https://marketplace.visualstudio.com/items?itemName=joelkoz.nodeuml) and produces
and object graph of NodeMDA meta elements represented by that file. 

## Model Object

The object graph returned by this reader will be a single `NodeMDA.Meta.Model` object.
It will be the Javascript equivalent of the following Typescript definition:

```
class Model {
    public name: String; // The project name
    public datatypes: NodeMDA.Meta.Datatype[];
    public stereotypes: NodeMDA.Meta.Stereotype[];
    public actors: NodeMDA.Meta.Actor[];
    public classes: NodeMDA.Meta.Class[];
}

```

## Supported UML Elements

This reader understands and populates the `model` instance with these UML elements:

* Package
* Datatype
* Stereotype
* Tag values
* Class
  - Attribute
  - Operation
  - Parameter
* Generalization
* Dependency
* Association
* Actor
