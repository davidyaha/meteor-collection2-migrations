/**
 * Created by David Yahalomi on 5/23/15.
 */

Tinytest.add('addCustomMigration - change value on document', function (test) {
  Books.attachSchema(Schemas.booksV1, {replace: true});

  Books.insert({name: 'The Rosie Project', author: 'Graeme C. Simsion', isbn: 'ISBN 0 71817 813 0'});

  Books.addCustomMigration('migrate isbn-10 to isbn-13', function () {
    Books.find({isbn: { $exists: true }}).forEach(function (doc) {
      var newIsbn = doc.isbn.replace('ISBN', 'ISBN-13 978');
      Books.update({_id: doc._id}, {$set: {isbn: newIsbn}}, {validate: false});
    });
  }, true);

  Books.attachSchema(Schemas.booksV2, {replace: true});

  test.equal(Books.find().count(), 1);
  test.equal(Books.findOne({name: 'The Rosie Project'}).isbn, 'ISBN-13 978 0 71817 813 0');
  test.equal(Books.findOne({name: 'The Rosie Project'}).sold, 0);
  test.equal(Books._migrations.findOne({_id: Books._name}).version, 2);

  teardown(test);
});

Tinytest.add('addCustomMigration - copy values to another collection', function (test) {
  Books.attachSchema(Schemas.booksV1, {replace: true});
  Stores.attachSchema(Schemas.storesV1, {replace: true});

  Books.insert({name: 'Crime and Punishment', author: 'Fyodor Dostoyevsky'});
  Books.insert({name: 'The Rosie Project', author: 'Graeme C. Simsion', isbn: 'ISBN 0 71817 813 0'});

  Stores.insert({name: 'The Travel Bookshop Ltd', address: '13 Blenheim Crescent, London W11 2EE, United Kingdom'});
  Stores.insert({name: 'Barnes & Noble', address: '555 5th Ave New York, NY, United States'});

  test.equal(Books.find().count(), 2, 'Inserted two books');
  test.equal(Stores.find().count(), 2, 'Inserted two stores');

  Stores.addCustomMigration('copy all book ids into stores', function () {

      Stores.update( { stock: { $exists: false } },
                     { $push: { stock: { $each: Books.find().map(function (doc) { return { book_id: doc._id } } ) } } },
                     { validate : false, filter: false , multi: true} );
  }, true);

  Stores.attachSchema(Schemas.storesV2, {replace: true});

  var store = Stores.findOne({name: 'The Travel Bookshop Ltd'});
  test.equal(store.stock.length, 2, 'Store ' + store.name + ' has two books in stock: ' + JSON.stringify(store.stock));

  store = Stores.findOne({name: 'Barnes & Noble'});
  test.equal(store.stock.length, 2, 'Store ' + store.name + ' has two books in stock: ' + JSON.stringify(store.stock));

  test.equal(Books._migrations.findOne({_id: Books._name}).version, 1, 'Books schema version is 1');
  test.equal(Stores._migrations.findOne({_id: Stores._name}).version, 2, 'Stores schema version is 2');

  teardown(test);
});

Tinytest.add('addCustomMigration - fail migration on regular expression mismatch', function (test) {
  Books.attachSchema(Schemas.booksV1, {replace: true});

  Books.insert({name: 'The Rosie Project', author: 'Graeme C. Simsion', isbn: 'ISBN 0 71817 813 0'});

  Books.attachSchema(Schemas.booksV2, {replace: true});

  test.equal(Books.find().count(), 1);
  test.equal(Books.findOne({name: 'The Rosie Project'}).isbn, 'ISBN 0 71817 813 0');
  test.equal(Books._migrations.findOne({_id: Books._name}).version, 1);

  teardown(test);
});
