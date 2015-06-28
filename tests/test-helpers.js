/**
 * Created by David Yahalomi on 5/23/15.
 */

teardown = function(test) {
  Books._migrations.remove({});
  Books.remove({});
  Stores.remove({});

  // Deletes collection2 fields
  delete Books._c2;
  delete Stores._c2;

  test.equal(Books._migrations.find().count(), 0, "Migrations collection is empty");
  test.equal(Books.find().count(), 0, "Books collection is empty");
  test.equal(Stores.find().count(), 0, "Stores collection is empty");
};
