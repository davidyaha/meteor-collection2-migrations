# Collection2-Migrations
[![Build Status](https://travis-ci.org/davidyaha/meteor-collection2-migrations.svg?branch=master)](https://travis-ci.org/davidyaha/meteor-collection2-migrations)

## You should probably use [bookmd:schema-migrations](https://www.youtube.com/watch?v=WABQiAwqVJg) 

### Watch my talk to find out why:

[![IMAGE ALT TEXT HERE](http://img.youtube.com/vi/WABQiAwqVJg/0.jpg)](http://www.youtube.com/watch?v=WABQiAwqVJg)


This package will help you manage your DB migrations with regard of [aldeed:collection2](https://github.com/aldeed/meteor-collection2) and [aldeed:simple-schema](https://github.com/aldeed/meteor-simple-schema).


### Important Notice - Backup of your current DB is strongly advised!


### Auto Migration

The package will note when there is a change in the schema and after a notable change it will try to auto migrate.
Auto migration will do the following for each document on the collection:
  - Remove any deleted fields from schema.
  - Use auto or default value to fill in any missing and required fields.
  - Use auto conversion of field types using the built in ability of collection2.
  - Auto convert types if possible.

Auto migration will currently not:
  - Move fields from one collection to another.
  - Rename a field.
  - Check for missing ids on field that suppose to relate to another document.
  - Rebuild indexes.
  - Auto fill values that fail on a regEx.
  
All of the above features are planned to be implemented eventually but I will sure appreciate code submissions.

### Using

Use the regular attachSchema call

```
Books = new Mongo.Collection('books');

var booksV1 = new SimpleSchema({
    name: {
      type: String
    },
    author: {
      type: String
    },
    isbn: { //ISBN 10
      type: String,
      regEx: /ISBN\x20(?=.{13}$)\d{1,5}([- ])\d{1,7}\1\d{1,6}\1(\d|X)$/,
      optional: true,
      unique: true
    }
  }
);

Books.attachSchema(booksV1);
```

Add custom migration functions to allow for more difficult migrations: 

```
var booksV2 = new SimpleSchema({
    name: {
      type: String
    },
    author: {
      type: String
    },
    isbn: { //ISBN 13
      type: String,
      regEx: /ISBN(?:-13)?:?\x20*(?=.{17}$)97(?:8|9)([ -])\d{1,5}\1\d{1,7}\1\d{1,6}\1\d$/,
      unique: true
    },
    sold: {
      type: Number,
      defaultValue: 0
    }
  }
);
Books.addCustomMigration('migrate isbn-10 to isbn-13', function () {
  Books.find({isbn: { $exists: true }}).forEach(function (doc) {
    var newIsbn = doc.isbn.replace('ISBN', 'ISBN-13 978');
    Books.update({_id: doc._id}, {$set: {isbn: newIsbn}}, {validate: false});
  });
}, true);

Books.attachSchema(booksV2);
```
