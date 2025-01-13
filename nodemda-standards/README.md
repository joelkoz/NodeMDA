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

### Security related
- SystemRole

## Modeling Conventions

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

1. There should be one class named `User` with the stereotype `Entity` in the root package of the model (i.e. the class
   should not be the child of a package). This `User` class must have AT LEAST the following three attributes:
   - `username` with a data type of `String` and a multiplicity of '1'
   - `password` with a data type of `Password` and a multiplicity of '1'
   - `roles` with a data type of `SystemRole` a multiplicity of '0..*', and a tagged value named `defaultValue` with a value of "['user']"

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

1. Since adding an association has the same effect as adding an attribute of that type, you can use classes in your model as the data type of an Attribute in an `Entity` class.  For example, class "Person" could have an attribute named "addresses", which is an array of "Address" POJO classes. Both "assocations" and "attributes with data type of *some class*" in practice generates the same code as they have the same semantics. It is recommended that you model "embedded" documents as "attributes", and model "references to other documents" as associations to keep the peristence method in 
your models clear.


## Special handling of One to Many relationships

A **one to many** relationship between two entities is a common pattern that is handled in a special way: the primary key of the **one** side is stored
as a property in the **many** side.  This property in the **many** side is called a **foreign key**. There is no need to store an actual property for
the **many** side on the **one** side, since the values can be looked up in the databasee. This attribute on the **one** side becomes a virtual/computed attribute
rather than a real one.  Since this is such a common pattern, the standards plugin performs a special transformation to the meta model.

Assume you have two entites: one named `Master` and one named `Slave`.  Assume there is a `one master to many slaves` relationship. The "array" attribute that
represents the **many** `Slave` class in `Master` is named `mySlaves`. The attribute in the `Slave` class that represents the **one** `Master` is named `myMaster`.
After processing by the Standards template support the meta model will have:

1. `Slave` will have a `NodeMDA.Atttribute` object named `myMaster` added to its `attributes` array. The `Attribute` object a property named `isForeignKey` that is set to TRUE. The `type` of the attrbute will be a `NodeMDA.Meta.ObjectDatatype` that references the `Master` class.

2. `Master` will NOT have a `NodeMDA.Attribute` object for the `Slave` in its `attributes` array. Instead, the `Attriubte` object **will* be created, but it will be added
to an array property named `virtuals`. It will have a `name` property of `mySlaves`, and a `type` property that is an instance of `NodeMDA.Meta.ObjectDatatype` that references the `Slave` class. It will also have a property named `_schemaDbProp.foreignKeyField` that is equal to `myMaster`, which is the name of the attribute in the `Slave` class
that is matched against `Master._id` when gathering all of the related slaves.

## Security

1. It is expected that there is a class named `User` with a stereotype of `Entity` as specified in [Modeling Conventions](#modeling-conventions) above.

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

## Template support

### Meta model mixins

To support all of the above conventions, this plugin provides the following mixin modifications to the meta model:

   - **`onModel`** 
     - **Getters**
       - **`entities()`** - returns all classes whose `stereotypeName` is `Entity`.

   - **`onAttribute`**  
     - **Getters**  
       - `jsIdentifierName()` returns the attribute name as the JavaScript identifier (commented-out logic shows how to prefix `_` for private attributes).  
       - `schemaDbProperties()` returns a JSON string of an object of database related properties:
         - `persistence` how is this attribute stored in a persistent store? Will be `"embed"` if the field should be embedded, or `undefined` otherwise.
         - `unique` true if this attribute is unique in any collection it is stored in
         - `foreignKeyField` - In a **one to many** relationship, this is the name of the attribute in the **many** class that matches the `_id` of this attribute's parent.
                [Special handling of One to Many relationships](#special-handling-of-one-to-many-relationships)
       - `_schemaDbProp` the pure javascript version of `schemaDbProperties()`
       - `isForeignKey` - will be true if this attribute's parent is the **many** side of a **one to many** relationship. The attribute is used to match against the `_id`
             property of the class on the **one** side of the relationship. [Special handling of One to Many relationships](#special-handling-of-one-to-many-relationships)
       - `isEntity()` checks if the attribute’s type is a class with stereotype `Entity`.  
       - `hasIndex()` checks for a `dbIndex` tag.  
       - `importedBySchema()` checks if the attribute is an object embedded or has a foreign key property.  
       - `visibleToForm()` indicates if this attribute should be visible on any UI related input form
       - `visibleToTable()` indicates if this attribute should be visible as a column in any UI related table
     - **Functions**  
       - `setSchemaDbProperty(name, value)` attaches schema metadata (e.g., `persistence: 'embed'` or `unique: true`).  

   - **`onObjectDatatype`**  
     - **Getters**  
       - `jsClassNameWithPath()` uses `jsPathToIdentifier()` to convert the object’s path.  

   - **`onClass`**  
     - **Getters**  
       - `jsClassNameWithPath()` converts full class path for imports.  
       - `jsPackageName()` converts package name to a JS-friendly path.  
       - `relativeParentPrefix()` computes how many directory levels to go up for import statements.  
       - `packageDirPath()` returns the class’s package path, ensuring it ends with a slash unless in the root.  
       - `isRoleRestricted()` checks if the class has any dependencies on actors.  
       - `roleList()` collects roles from `dependentActors`, including any inherited from the parent class.  
       - `stringifyRoleList()` JSON-encodes `roleList` with single quotes.  
       - `isEntity()` checks if the stereotype is `Entity`.  
       - `isEnumeration()` checks if the stereotype is `Enumeration` or `enumeration`.
       - `isUserEntity()` returns TRUE if this class is named `User` and has the `Entity` stereotype
       - `readPermissions()`, `writePermissions()`, `deletePermissions()`, `ownPermission()` return security settings.  
       - `isUserOwned()` returns `true` if the class ownership is assigned to a role other than `admin`.  
       - `genCRUD()` returns `true` if the UI code should be generated (requires `genREST` and not tagged `noUI`).  
       - `genREST()` returns `true` if the class is not private and not tagged `noREST`.  
       - `formAttribs()` returns an array of all attributes that are `visibleToForm`
       - `tableAttribs()` returns an array of all attribute that are `visibleToTable`
       - `entityAttribs()` returns an array of all attributes that have an object datatype that is an `Entity` class
       - `tableColumnsVisible()` returns a count of the number of attributes that are `visibleToTable`
       - `tableColumnsInvisible()` returns a count of the number of attributes that are NOT `visibleToTable`
     - **Functions**  
       - `addPermission(perm, roleName)` modifies the class’s internal `permissions` structure (e.g., adding `'read'`, `'write'`, `'delete'`, or `'own'`).  

   - **`onDependency`**  
     - **Getters**  
       - `isActor()` checks if `otherObject` is an `Actor`.  
       - `permissions()` returns an array of parsed permissions from the `permissions` tag (defaults to `read, write, delete`).  

   - **`onActor`**  
     - **Getters**  
       - `roleName()` produces a camelCase role name by stripping any “Role” suffix from the actor name.  

   - **`onMetaElement`**  
     - **Getters**  
       - `jsCommentsFormatted()` splits the element’s `comment` into lines of at most 80 characters, replacing newlines with `<p>`.
       - `singularName()` returns the singular form of the element name (uses `pluralize`).  
       - `pluralName()` returns the element name in plural form.  

---

### Handlebars helper functions

#### 1. `isNonEmptyArray.js`
**Purpose**  
Checks if a value is an array with at least one element.

```js
// Example usage in a .hbs template:
{{#if (isNonEmptyArray myArrayVar)}}
  The array has content.
{{else}}
  The array is empty or not an array.
{{/if}}
```

---

#### 2. `kebabCase.js`
**Purpose**  
Converts a string to kebab-case (lowercase words separated by `-`).

```js
// Example usage:
{{kebabCase "MyExampleString"}} 
// Outputs: "my-example-string"
```

---

#### 3. `singularOf.js`
**Purpose**  
Returns the singular form of a word using `pluralize`.

```js
// Example usage:
{{singularOf "People"}}
// Outputs: "Person"
```

---

#### 4. `jsStringEscape.js`
**Purpose**  
Escapes a string so it can be safely inserted as a valid JavaScript literal (quotes are removed).

```js
// Example usage:
var myString = "{{jsStringEscape "Hello \"there\""}}";
// Outputs: var myString = "Hello \"there\"";
```

---

#### 5. `camelToWords.js`
**Purpose**  
Transforms a camelCase or PascalCase string into a spaced phrase, capitalizing the first letter. Also replaces underscores with spaces.

```js
// Example usage:
{{camelToWords "myVariableName"}}
// Outputs: "My Variable Name"
```

---

#### 6. `setProperties.js`
**Purpose**  
Allows you to set multiple hash arguments as top-level properties on the template context for a block.

```handlebars
{{#setProperties title="Hello" count=5}}
  Title: {{title}}, Count: {{count}}
{{/setProperties}}
```

---

#### 7. `outputIfEqual.js`
**Purpose**  
Outputs the block if two parameters are strictly equal. Otherwise outputs the `{{else}}` block.

```handlebars
{{#outputIfEqual class.name "Person"}}
  This is the Person class.
{{else}}
  This is not the Person class.
{{/outputIfEqual}}
```

---

#### 8. `ifBoth.js`
**Purpose**  
Renders the block if both `condition1` and `condition2` are truthy. Otherwise renders the `{{else}}` block.

```handlebars
{{#ifBoth class.isEntity class.hasOperations}}
  Entity with operations
{{else}}
  Not an entity with operations
{{/ifBoth}}
```

---

#### 9. `uppercaseFirst.js`
**Purpose**  
Capitalizes the first letter of a string.

```js
{{uppercaseFirst "employee"}}
// Outputs: "Employee"
```

---

#### 10. `isdefined.js`
**Purpose**  
Checks if a value is not `undefined`.

```handlebars
{{#if (isdefined class.name)}}
  The class name is {{class.name}}
{{else}}
  This class is unnamed
{{/if}}
```

---

#### 11. `renderOnce.js`
**Purpose**  
Prevents repeated output if a certain object is already rendered. Useful for avoiding circular references in recursive templates.

```handlebars
{{#renderOnce class}}
  {{class.name}} details ...
{{/renderOnce}}
```

---

#### 12. `concat.js`
**Purpose**  
Concatenates multiple arguments into a single string.

```handlebars
<p>{{concat "api/" class.name "/endpoint"}}</p>
// Outputs: <p>api/Person/endpoint</p> for class.name = "Person"
```

---

#### 13. `lowercaseFirst.js`
**Purpose**  
Lowercases the first character of a string.

```js
{{lowercaseFirst "Employee"}}
// Outputs: "employee"
```

---

#### 14. `safePreserve.js`
**Purpose**  
Returns `preserve!` if the two string parameters match, otherwise `preserve`. This is typically used with NodeMDA output directives.

```handlebars
##output {{safePreserve class.name "User"}}
```

---

#### 15. `lowercase.js`
**Purpose**  
Converts a string to all lowercase.

```js
{{lowercase "HelloWORLD"}}
// Outputs: "helloworld"
```

---

#### 16. `pluralOf.js`
**Purpose**  
Returns the plural form of a word using `pluralize`.

```js
{{pluralOf "Person"}}
// Outputs: "People"
```

---

#### 17. `rootNamespaceName.js`
**Purpose**  
Splits a dot-delimited name (e.g. `my.company.project`) and returns the first path element as a Handlebars SafeString.

```handlebars
Root namespace: {{rootNamespaceName "my.company.project"}}
<!-- Outputs: "my" -->
```

---

#### 18. `eval.js`
**Purpose**  
If the first argument is a function, calls it with subsequent arguments. Otherwise returns an empty string.

```handlebars
{{eval someFunction arg1 arg2}}
// If `someFunction` is a JS function, it is invoked as someFunction(arg1, arg2).
```

---

#### 19. `initJSNamespace.js`
**Purpose**  
Initializes nested JavaScript objects for a given namespace on a variable. Produces lines like `myVar.myNamespace = myVar.myNamespace || {};`.

```handlebars
{{initJSNamespace "myVar" "MyCompany.Project"}}
<!-- 
Outputs:
myVar.MyCompany = myVar.MyCompany || {};
myVar.MyCompany.Project = myVar.MyCompany.Project || {};
-->
```

---

#### 20. `camelCase.js`
**Purpose**  
Converts any string to lowerCamelCase by splitting on spaces or periods, capitalizing each word after the first, then joining them.

```js
{{camelCase "My example phrase"}}
// Outputs: "myExamplePhrase"
```

---

#### 21. `outputUnlessEqual.js`
**Purpose**  
Outputs the block if `param1` and `param2` are not strictly equal. Otherwise renders the `{{else}}` block.

```handlebars
{{#outputUnlessEqual class.stereotypeName "Entity"}}
  This is not an entity.
{{else}}
  This is an entity.
{{/outputUnlessEqual}}
```

---

#### 22. `defaultTo.js`
**Purpose**  
Returns the first argument if it is truthy. Otherwise returns the second argument.

```handlebars
{{defaultTo class.name "UnnamedClass"}}
<!-- If class.name is falsy, outputs "UnnamedClass". Otherwise outputs class.name. -->
```

---
## Summary

`StandardSupport.js` supplies a consistent approach to:
1. **Associations**: Turned into class attributes for simpler template use.  
2. **Validation**: Ensures a root `User` class with mandatory attributes.  
3. **Mixin** Additions: Provides a variety of getters/functions for code generation (path resolution, naming conventions, security checks, schema metadata).  
4. **Permissions**: Applies defaults based on UML `Dependency` to `Actor`, or by class visibility.  
5. **Enumerations**: Transforms UML classes with stereotype `Enumeration` into real enumerations, and adjusts any referencing attributes.

All these operations ensure NodeMDA Standards–based plugins can rely on a uniform, enhanced meta model. 



