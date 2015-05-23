/**
 * Created by David Yahalomi on 5/23/15.
 */

Tinytest.add('attachSchema - registering schema for first time', function (test) {
  Books.attachSchema(Schemas.booksV1);
  Stores.attachSchema(Schemas.storesV1);

  test.equal(Books._migrations.find().count(), 2);
});

Tinytest.add('attachSchema - changing the schema', function (test) {
  Books.insert({name: 'Crime and Punishment', author: 'Fyodor Dostoyevsky'});

  Books.attachSchema(Schemas.booksV2); //merge with current schema

  test.equal(Books.find().count(), 1);
  test.equal(Books._migrations.findOne({_id: Books._name}).version, 2, 'new version of books schema registerd');

  teardown(test);
});

Tinytest.add('attachSchema - no change', function (test) {
  Stores.attachSchema(Schemas.storesV1, {replace: true});

  test.equal(Stores._migrations.findOne({_id: Stores._name}).version, 1);

  Stores.attachSchema(Schemas.storesV1, {replace: true});

  test.equal(Stores._migrations.findOne({_id: Stores._name}).version, 1);

  teardown(test);
});



Tinytest.add('attachSchema - no field that is required and no default value or auto value', function (test) {
  Books.attachSchema(Schemas.booksV1, {replace: true});
  Stores.attachSchema(Schemas.storesV1, {replace: true});

  Books.insert({name: 'The Rosie Project', author: 'Graeme C. Simsion'});

  // failure to migrate
  Books.attachSchema(Schemas.booksV2, {replace: true});

  // manual fix
  Books.update({name: 'The Rosie Project'}, {$set: {isbn: 'ISBN-13 978 0 71817 813 0'}}, {validate: false});

  // try again
  Books.attachSchema(Schemas.booksV2, {replace: true});

  test.equal(Books.find().count(), 1);
  test.equal(Books.findOne({name: 'The Rosie Project'}).isbn, 'ISBN-13 978 0 71817 813 0');
  test.equal(Books.findOne({name: 'The Rosie Project'}).sold, 0);
  test.equal(Books._migrations.findOne({_id: Books._name}).version, 2);

  teardown(test);
});