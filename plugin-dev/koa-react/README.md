NodeMDA Koa-React 
======================

A plugin to generate a full stack SOA application using Koa, Mongoose, React, and Mantine, complete
with Docker files.

NodeMDA is a node.js library used for generating software source code for any project or language using the 
*Model Driven Architecture* approach. This approach allows you to create large portions of code 
for your software projects by using a UML tool to diagram software concepts.

This package is a plugin for NodeMDA to generate large portions of your application. The code generator supports
generation for database schemas, data access service objects, RESTful middle tier service interfaces, and a
functioning UI in React plus Mantine that supports user registration and sign-in, as well as CRUD on all of your database objects.


Workflow
------
The general workflow for using NodeMDA with this plugin is as follows:

1. Using StarUML (or any other UML modler NodeMDA has a reader for), create or modify the *model* of your 
software architecture. A UML Profile exists with pre-defined Stereotypes to quickly model database entities
and services, as well as security requirements for access to both.

2. The model is processed using NodeMDA to generate source code and other project artifacts. In general, NodeMDA generates
all of the boilerplate code and stubs for things such as your services and persistence entities.

3. Where necessary, code stubs are filled in by hand to supply the business logic or add other functionality.

4. The resulting code is tested using the mocha unit tests, or manual testing.  If additions or 
changes are required, the process returns to step #1 where the *model* is modified and the entire cycle is repeated.


Usage
------

For complete documentation on using NodeMDA, see the [NodeMDA readme file](https://www.npmjs.com/package/nodemda)


Modeling Conventions
--------------------

Code generation by NodeMDA is currently based on three key UML artifacts: Classes, Datatypes, and Stereotypes. The general strategy for creating your model is as follows:

1. Create one or more Class diagrams.

1. Add one or more class definitions to your diagram(s) based on your design.

1. Tag each class with one of the stereotypes found in the KoaReactProfile. Database entities
are marked with the `Entity` stereotype, and service interfaces are marked with the `Service` stereotype. You can also create generic data structures by marking them as `POJO`

1. Populate your classes with attributes and/or methods, making sure to specify a Datatype for
your attributes and method parameters.  Datatypes used MUST be one of the data types defined in the
UML Profile that comes with this plugin, or another class you define in your model.

1. There is no semantic meaning for attributes on a `Service` class. This plugin also does not currently support methods on an `Entity` class.  

1. Entity attributes that have a visibility other than "public" will be considered "for internal use", and thus will not be present in the CRUD user interface code.  Attributes marked as "protected" are available to leave the system via the REST interface, but attributes marked as "private" will be filtered out by the backend before the REST request responds.

1. The tag `uiTableColumn` should be added to one or more entities to indicate which attributes are to be included
in the CRUD selection table. At least one column in each `Entity` should be tagged with uiTableColumn.

1. `Entity` attributes can be marked as "unique" to add the "unique" index to the mongo database. They
can be tagged with the `dbIndex` tag to create an index on that field.

1. The `minVal` and `maxVal` tags can be added to numbers to be ranges on the possible values.

1. Specify a "multiplicity" value for class Attributes and method Parameters to indicate if the
value is optional or not. If the Multiplicity is not explicitly set, "0..1" is assumed, which translates
to an "optional value" for most plugins.  Attributes and parameters can be made "required" by
setting the lower limit of the multiplicity to one (e.g. "1" or "1..*").

1. Arrays can be modeled by specifying an upper limit of the multiplicity on an attribute or
parameter to a value that is greater than one (e.g. "0..*").


1. You can draw an association between an `Entity` class and another class that is marked as an `Entity`.  An association between an `Entity` and a non-entity (`POJO`) implies an
embedded class (i.e. that data of the POJO is stored inside the `Entity` document in the database).
An association between one `Entity` and another `Entity` implies a "reference" type relationship between
two different database documents.  The relationships can be "zero to one", "one to one", "zero to many",
or "one to many." A "Many to many" relationship gets stored as an array of references in both entity
documents and requires that you manually manage the array values. For this reason, using "many to many"
is not recommended.

1. As an alternative way of specifying associtations, you can use classes in your model as the data type
of an Attribute in an `Entity` class.  For example, class "Person" could have an attribute named "addresses", which is an array of "Address" POJO classes.

1. Both "assocations" and "attributes with type *some class*" in practice generates the same code for Entities
as they have the same semantics. It is recommended that you model "embedded" documents as "attributes of type
*another class*", and model "references to other documents" as associations to keep the peristence method in 
your models clear.

1. You can draw a dependency from a service to an entity to indicate the service would like easy
access to the data access service interface of the entity.  You can also draw dependencies to other services
and utilize those in your implementation.


Future Features on Roadmap 
==========================

Remote access via REST and CRUD
-------------------------------
1. For every Entity defined in the system, a CRUD user interface is generated in the front end web app. You can prevent
this UI from being generated by adding the tag "noCRUD=true" to the Entity. 

1. For every Entity defined in the system a REST interface is added to the API that allows for the normal CRUD operations.
You can prevent this interface from being generated by adding the tag "noREST=true" to the Entity. Note that the UI depends
upon the REST interface, so if you use the noREST=true tag but the noCRUD=true tag is NOT used, that UI will not work
without external code to support it.


Security
---------
1. You can define system roles by adding an Actor to your model. You can draw 
a dependency from an Entity or a Service to an Actor to indicate a security requirement.  Two pre-defined actors exist
in the default model's profile (AdminRole and UserRole), but you can add more.  
The name of the required role is the name you assign to the actor (minus the suffix "Role") in camel case. If you don't use the "Role" suffix, the role name is the actor's name verbatim. Examples: an Actor named SubscriberRole would be assumed to represent a role named "subscriber". An Actor named "Paid Subscriber" would create a role named "paidSubscriber"

1. The default permissions on a dependency from an Entity to a Role is "read,write". That is, a user in that role
can see those entities, and can edit them.  You can override this default by adding a tag named "permissions" to
the depedency.  The tag value can be one or more of "own", "read", and/or "write", separated by commas. All entities
are assumed to be "owned" by the system unless "own" is specified in the value of an explicit permission tag. When an entity is "owned" by any user role other than "Admin", a special "_ownedBy" property is added to that entity and is set
to the user Id that created it.  Only the "Admin" user and the user who created it can write those records.

1. An Entity's default visibility is "public". An Entity can be made "private" by setting the visibliity of the
Entity to "protected" or "private" in the UML model, or by adding a tag named "private" to the Entity with
a value of "true".  A Private entity can only be viewed by the owner of that entity (i.e. the "read" permission is
only valid if the user owns the Entity). The Admin user is assumed to own the Entity if explicit ownership is
not assigned to another role

1. If there is no explicit dependency from an Entity to an Actor/role, then the Admin user is assumed to have
"read,write" permissions, and all other users are assumed to have "read" permissions.  If there exists
at least one explicit dependency from an Entity to an Actor/role, then all users not specified are assumed
to have NO permissions.  The Admin user is assumed to have "read,write" permissions on all Entities unless
an explicit dependency for the AdminRole with an explicit "permissions" tag exists.


Example Model
----------------------------
![alt text](https://github.com/joelkoz/NodeMDA/raw/master/plugin-dev/koa-react/koa-react-default-model.png "Example UML processed by this plugin")
