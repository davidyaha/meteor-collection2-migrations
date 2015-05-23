/**
 * Created by David Yahalomi on 5/23/15.
 */

teardown = function(test) {
  Books._migrations.remove({});
  Books.remove({});
  Stores.remove({});
  test.equal(Books._migrations.find().count(), 0);
  test.equal(Books.find().count(), 0);
  test.equal(Stores.find().count(), 0);
};
