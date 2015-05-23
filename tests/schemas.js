/**
 * Created by David Yahalomi on 5/23/15.
 */

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
  gross: {
    type: Number,
    defaultValue: 0
  }
});

var storesV2 = new SimpleSchema({
  name: {
    type: String
  },
  address: {
    type: String
  },
  gross: {
    type: Number,
    defaultValue: 0
  },
  stock: {
    type: [Object],
    defaultValue: []
  },
  'stock.$.book_id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  'stock.$.quantity': {
    type: Number,
    min: 0,
    defaultValue: 0
  }
});

Schemas = {booksV1: booksV1, booksV2: booksV2, storesV1: storesV1, storesV2: storesV2};