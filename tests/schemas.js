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

var booksV3 = new SimpleSchema({
    name: {
      type: String
    },
    author: {
      type: String
    }
  }
);

var booksV4 = new SimpleSchema({
    name: {
      type: String
    },
    author: {
      type: String
    },
    isbn: { //ISBN 13
      type: String,
      regEx: /ISBN(?:-13)?:?\x20*(?=.{17}$)97(?:8|9)([ -])\d{1,5}\1\d{1,7}\1\d{1,6}\1\d$/,
      optional: true,
      unique: true
    },
    sold: {
      type: String,
      defaultValue: "0"
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

var storesV3 = new SimpleSchema({
  name: {
    type: String
  },
  name_sorting: {
    type: String,
    autoValue: function () {
      var name = this.field('name');
      if (name.isSet)
        return name.value.toLowerCase();
      else
        return this.unset();
    }
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

var storesV4 = new SimpleSchema({
  name: {
    type: String
  },
  name_sorting: {
    type: String,
    autoValue: function () {
      var name = this.field('name');
      if (name.isSet)
        return name.value.toLowerCase();
      else
        return this.unset();
    }
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
  },
  'update_count' : {
    type: Number,
    min: 0,
    optional: true,
    autoValue: function () {
      return this.isSet ? 0 : this.value + 1;
    }
  }
});

Schemas = { booksV1: booksV1, booksV2: booksV2, booksV3: booksV3, booksV4: booksV4,
            storesV1: storesV1, storesV2: storesV2, storesV3: storesV3, storesV4: storesV4};
