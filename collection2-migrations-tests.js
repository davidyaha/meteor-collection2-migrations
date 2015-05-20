Books = new Mongo.Collection('books');
Stores = new Mongo.Collection('stores');

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


var storesV1 = new SimpleSchema({
  name: {
    type: String
  },
  address: {
    type: String
  },
  stock: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id
  },
  gross: {
    type: Number
  }
});

Tinytest.add('attachSchema - registering schema for first time', function (test) {
  Books.attachSchema(booksV1);
  Stores.attachSchema(storesV1);

  test.equal(Books._migrations.find().count(), 2);
});

Tinytest.add('attachSchema - changing the schema', function (test) {
  Books.insert({name: 'Crime and Punishment', author: 'Fyodor Dostoyevsky'});

  Books.attachSchema(booksV2); //merge with current schema

  test.equal(Books.find().count(), 1);
  test.equal(Books._migrations.findOne({_id: Books._name}).version, 2, 'new version of books schema registerd');

  teardown(test);
});

Tinytest.add('attachSchema - no change', function (test) {
  Stores.attachSchema(storesV1, {replace: true});

  test.equal(Stores._migrations.findOne({_id: Stores._name}).version, 1);

  Stores.attachSchema(storesV1, {replace: true});

  test.equal(Stores._migrations.findOne({_id: Stores._name}).version, 1);

  teardown(test);
});


Tinytest.add('attachSchema - custom change', function (test) {
  Books.attachSchema(booksV1, {replace: true});
  Stores.attachSchema(storesV1, {replace: true});

  Books.insert({name: 'The Rosie Project', author: 'Graeme C. Simsion', isbn: 'ISBN 0 71817 813 0'});

  Books.addCustomMigration('migrate isbn-10 to isbn-13', function () {
    Books.find({isbn: { $exists: true }}).forEach(function (doc) {
      var newIsbn = doc.isbn.replace('ISBN', 'ISBN-13 978');
      Books.update({_id: doc._id}, {$set: {isbn: newIsbn}}, {validate: false});
    });
  }, true);

  Books.attachSchema(booksV2, {replace: true});

  test.equal(Books.find().count(), 1);
  test.equal(Books.findOne({name: 'The Rosie Project'}).isbn, 'ISBN-13 978 0 71817 813 0');
  test.equal(Books.findOne({name: 'The Rosie Project'}).sold, 0);
  test.equal(Books._migrations.findOne({_id: Books._name}).version, 2);

  teardown(test);
});

Tinytest.add('attachSchema - no field that is required and no default value or auto value', function (test) {
  Books.attachSchema(booksV1, {replace: true});
  Stores.attachSchema(storesV1, {replace: true});

  Books.insert({name: 'The Rosie Project', author: 'Graeme C. Simsion'});

  // failure to migrate
  Books.attachSchema(booksV2, {replace: true});

  // manual fix
  Books.update({name: 'The Rosie Project'}, {$set: {isbn: 'ISBN-13 978 0 71817 813 0'}}, {validate: false});

  // try again
  Books.attachSchema(booksV2, {replace: true});

  test.equal(Books.find().count(), 1);
  test.equal(Books.findOne({name: 'The Rosie Project'}).isbn, 'ISBN-13 978 0 71817 813 0');
  test.equal(Books.findOne({name: 'The Rosie Project'}).sold, 0);
  test.equal(Books._migrations.findOne({_id: Books._name}).version, 2);
});

Tinytest.add('Teardown', teardown);


function teardown(test) {
  Books._migrations.remove({});
  Books.remove({});
  test.equal(Books._migrations.find().count(), 0);
  test.equal(Books.find().count(), 0);
};
