# NodeMDA Standards

## Introduction

NodeMDA Standards is a plugin for the [NodeMDA](https://github.com/joelkoz/NodeMDA) code generation engine. 
It is a `mixin` plugin that defines a standard
set of data types and Handlebars helpers that are used by most plugins in the NodeMDA universe.

The Standards mixin functions also performs a set transformations on to the meta model before code generation begins. 
These transformation convert associations to attributes of the classes, reducing the complexity of code templates.

## Standard Data types

The Datatype object that is assigned to an attribute, parameter, or operation return type should have a name that matches
one of the following in in both case and (lack of) punctuation:

### Primatives
- String
- Number
- Boolean
- DateTime

### Higher order string types
- Text
- FullName
- FirstName
- LastName
- Password
- Phone
- Email
- Url
- StreetAddress
- City
- State
- PostalCode
- CreditCardNumber

### Higher order numeric types
- Integer
- Decimal
- Currency

### Higher order date types
- Date
- Time

### Common enumerations
- YesNo
- Sex
- OnOff



## Modeling Convention

All code generation plugins that utilize the the "Standards" expect the following conventions to be used in the models
used as input to NodeMDA. The standard is currently based on four key UML artifacts: Classes, Datatypes, Stereotypes, and Actors.
The general strategy for creating your model is as follows:

1. Create one or more Class diagrams.

1. Add one or more class definitions to your diagram(s) based on your design.

1. Tag each class with a stereotype with one of the following names:
   - `Entity` Indicates the class is a persistent/database entity
   - `Service` Indicates the class defines a "Service" interface (e.g. for remote procedure calls)
   - `POJO` Indicates the class is a "Plain Old Javascript Object", meaning a simple class definition that holds
       data. This stereotype applies to all programming language targets, not just Javascript (despite its name).
 
1. Populate your classes with attributes and/or methods, making sure to specify a Datatype for
your attributes and method parameters.  Datatypes used MUST be one of the standard data types listed above.

1. You can add an Enumeration datatype to your model in one of two ways: 
   - Add an "Enumeration" object that is native to your UML modeling system and populate it with Enumeration Literals
   - Add a class to your model and use the "Enumeration" stereotype. In this case, each attribute you define will be used as one
     of the possible enumeration literal values.

1. Entity attributes that have a visibility other than "public" will be considered "for internal use", and thus will not be present in the CRUD user interface code.  Attributes marked as "protected" are available to leave the system via the any remoting interface, but attributes marked as "private" will be filtered out by the backend before the remote request responds.

1. The tag `uiTableColumn` with a value of "true" can be added to one or more of an Entity's attributes to indicate
which attributes are to be included in the frontend's CRUD selection table. If no attribute is explicitly tagged
with "uiTableColumn", then ALL attributes that would otherwise be included on a form (see "visibility" above) are 
assumed to also be desired as table columns.  This fact can be handy for entities with a small number of attributes, 
as it saves you time when modeling.

1. `Entity` attributes can be marked as "unique" to add the "unique" index to the mongo database. They
can be tagged with the `dbIndex` tag to create an index on that field.

1. The `minVal` and `maxVal` tags can be added to numbers to be ranges on the possible values.

1. Specify a "multiplicity" value for class Attributes and method Parameters to indicate if the
value is optional or not. If the Multiplicity is not explicitly set, "0..1" is assumed, which translates
to an "optional value" for most plugins.  Attributes and parameters can be made "required" by
setting the lower limit of the multiplicity to one (e.g. "1" or "1..*").

1. Arrays can be modeled by specifying an upper limit of the multiplicity on an attribute or
parameter to a value that is greater than one (e.g. "0..*").


## Special handling of associations

1. You can draw an association between any two classes. A navigable association has the same effect as adding
an attribute to the class that has a data type of the associated class. An association is considered "navigable"
if it is explicitly marked as "navigable" in the UML, or if has been given an explicit name.  If an association
is marked as navigable but has not been given an explicit name, a default name will be provided. An association
end that is explictly marked "not navigable" will not be navigable even if it has been given a name.

1. An association between an `Entity` and a non-entity (`POJO`) implies an
embedded class (i.e. that data of the POJO is stored inside the `Entity` document in the database).
An association between one `Entity` and another `Entity` implies a "reference" type relationship between
two different database documents.  

1. In an association, you can specify a multiplicity on each end of the association. the relationships can be "one to one", "one to many"
"one to zero or one", or "one to zero or many",
A "Many to many" relationship gets stored as an array of references in BOTH entity
documents and requires that you manually manage the array values. For this reason, using "many to many"
is not recommended.

1. Since adding an association has the same effect as adding an attribute of that type, you can use classes in your model as the data type of an Attribute in an `Entity` class.  For example, class "Person" could have an attribute named "addresses", which is an array of "Address" POJO classes. Both "assocations" and "attributes with data type of *some class*" in practice generates the same code as they have the same semantics. It is recommended that you model "embedded" documents as "attributes", and model "references to other documents" as associations to keep the peristence method in 
your models clear.


## Security

1. Security is handled using a role based system.  There are three implied roles in the system: AdminRole, UserRole, and GuestRole. Any
authenticated user has the UserRole.  Unauthenticated users have the GuestRole.  The AdminRole is reserved for system administrators.
You can add additional roles to the system by defining Actor elements in your UML model. The name of the role will be the camel case of
the name you assign to the actor, unless it has the suffix of "Role", in which case that suffix will be dropped. Examples: an Actor named SubscriberRole would be assumed to represent a role named "subscriber". An Actor named "Paid Subscriber" would create a role named "paidSubscriber"

1. There are three basic permissions each Entity has: read, write, and delete. An Entity has one or more roles associated with each of these permissions. The AdminRole always has read, write, and delete permissions on an Enity.

1. Each Entity is "owned" either by the system, or by a specific authenticated user. A "user owned" Entity is owned by the creator of the Entity,
and by default it can only be modified by the owner or the administrator. A system owned Entity does not belong to any particular user, and whether or not it can be modified depends on how the permissions are modeled. An Entity is considered "user owned" if ownership is assigned to any
role other than the AdminRole. If any user owned entities are defined, a fourth implied role named "owner" is added to the system.

1. The recommended way to define a permission is to draw a dependency from the Entity to one or more Actors. Each dependency will
grant read, write, and delete permissions to users who have the role represented by the Actor, unless you refine the permissions using
a tagged value (see below). Admin users always have these permissions, so it is not necessary to explicitly grant the AdminRole 
permissions unless it is the ONLY role you are assigning, and you want to restrict the Entity to "admin only" visibility and modification.

1. You can refine the permissions granted to a particular role by adding a tagged value named "permissions" to the dependency. The
value of the tag can be one or more of "own", "read", "write", or "delete", each separated by either a space, comma, or one of the
other special separator characters: ".", "-", "/", ";", or ":".  In reality, only the first letter of the permission is looked
at in a case insensitive manner, so you can define a permission value in whatever combination makes the most sense to you using
those separators. Other examples for "read,write,delete" include "r-w-d" and "Rd:Wr:Del".  The "own" permission can only be 
assigned to a single role for any given Entity.  Any role other than "AdminRole" given the "own" permission implies a user
owned entity (see above).

1. If no explicit permissions are defined for an entity by drawing a dependency, ownership is assigned to the Admin role
and the other permissions depends on the Entity's visibility. A "public" visibility will allow unauthenticated users to read, write, 
and delete the data (i.e. R-W-D to GuestRole). If the visibility is "protected", then R-W-D permissions are granted to UserRole. 
If it is private, then no user, including the AdminRole, can even read the data via the REST interface.  The Entity will exist
strictly for internal system use only. Note that most UML modeling software defaults to "public" visiblity, and that grants
GuestRole read,write,delete permissions. For this reason, it is best to be explicit about security and to always draw
security dependencies on your entities.


## Control generation of code for REST and CRUD

1. For every Entity defined in the system, a CRUD user interface is generated in the front end app. You can prevent
this UI from being generated by adding the tag "noUI=true" to the Entity. 

1. For every Entity defined in the system a REST interface is added to the API that allows for the normal CRUD operations.
You can prevent this interface from being generated by setting the visibility of your Entity to "private", or by adding the tag 
"noREST=true" to the Entity. Note that the UI depends upon the REST interface, so if you use the noREST=true noUI will automatically 
be set to true also.
