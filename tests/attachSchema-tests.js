/**
 * Created by David Yahalomi on 5/23/15.
 */

Tinytest.add('attachSchema - registering schema for first time', function (test) {
  Books.attachSchema(Schemas.booksV1);
  Stores.attachSchema(Schemas.storesV1);

  test.equal(Books._migrations.find().count(), 2);
});

Tinytest.add('attachSchema - add fields to the schema', function (test) {
  Books.insert({name: 'Crime and Punishment', author: 'Fyodor Dostoyevsky'});

  Books.attachSchema(Schemas.booksV2); //merge with current schema

  test.equal(Books.find().count(), 1);
  test.equal(Books._migrations.findOne({_id: Books._name}).version, 2, 'new version of books schema registerd');

  teardown(test);
});

Tinytest.add('attachSchema - call with null', function (test) {
  Books.attachSchema(null);

  test.equal(Books._migrations.find().count(), 0);
  teardown(test);
});

Tinytest.add('attachSchema - change field type', function (test) {
  Books.attachSchema(Schemas.booksV1);
  Books.attachSchema(Schemas.booksV2); // merge into V1 - isbn is optional

  Books.insert({name: 'Crime and Punishment', author: 'Fyodor Dostoyevsky'});

  Books.attachSchema(Schemas.booksV4, {replace: true});

  test.equal(Books.findOne().sold, "0", "crimeNPunishment has string typed zero");
  test.equal(Books.find().count(), 1);
  test.equal(Books._migrations.findOne({_id: Books._name}).version, 3);

  teardown(test);
});

Tinytest.add('attachSchema - remove fields from the schema', function (test) {
  Books.attachSchema(Schemas.booksV1);

  Books.insert({name: 'Crime and Punishment', author: 'Fyodor Dostoyevsky'});
  Books.insert({name: 'The Rosie Project', author: 'Graeme C. Simsion', isbn: 'ISBN 0 71817 813 0'});

  var crimeNPunishment = Books.findOne({name: 'Crime and Punishment'});
  test.equal(crimeNPunishment.author, 'Fyodor Dostoyevsky');

  var rosieProject = Books.findOne({name: 'The Rosie Project'});
  test.equal(rosieProject.isbn, 'ISBN 0 71817 813 0');

  Books.attachSchema(Schemas.booksV3, {replace: true});

  test.equal(Books.find().count(), 2);

  crimeNPunishment = Books.findOne({name: 'Crime and Punishment'});
  test.equal(crimeNPunishment.author, 'Fyodor Dostoyevsky');
  test.isUndefined(crimeNPunishment.isbn);

  rosieProject = Books.findOne({name: 'The Rosie Project'});
  test.isUndefined(rosieProject.isbn);

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
