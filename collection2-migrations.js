Mongo.Collection.prototype._migrations = new Mongo.Collection('c2Migrations');
Mongo.Collection.prototype._migrations.customMigrations = {};


var attachSchema = Mongo.Collection.prototype.attachSchema;

/**
 * Overrides the collection2 attachSchema function. This will first call
 * the attachSchema of the collection2 package. Then it will start validating
 * the collection data and will execute the detected automatic migrations
 * as well as the custom migration registered with the addCustomMigration method.
 *
 * @param ss - the SimpleSchema or schema Object given to the regular attachSchema.
 * @param options - not used by this override. passed as is to the regular attachSchema.
 */
Mongo.Collection.prototype.attachSchema = function registerMigration(ss, options) {
  var self = this;

  var returnedValue = attachSchema.apply(self, arguments);

  var newSchema = ss instanceof SimpleSchema ? ss.schema() : ss;

  var migrationObject = self._migrations.findOne({_id: self._name});

  if (migrationObject) {
    var currentSchemaKeys = migrationObject.keys;
    var currentSchemaValues = migrationObject.values;
  }

  if (newSchema && (!_.isEqual(currentSchemaKeys, _.keys(newSchema)) ||
                    !_.isEqual(currentSchemaValues, _.values(newSchema)))) {

    if (validateCollection(self)){
      if (!currentSchemaKeys) {
        console.log("Collection2-Migrations been activated for the", self._name, "collection\n" +
          "It will now start track the associated schema versions");

        self._migrations.insert({ _id: self._name, version: 1,
                                  keys: _.keys(newSchema), values: _.values(newSchema)});
      } else {
        console.log("The given schema for", self._name, "is different from the current tracked version.\n" +
          "The new version number is", migrationObject.version + 1);
        self._migrations.update({_id: self._name},
                                { $inc: { version: 1},
                                  $set : {keys: _.keys(newSchema), values: _.values(newSchema)}});
      }

      self.runMigrations();
    } else
      console.log("Could not validate and update collection", self._name,". schema did not register.");

  } else {
    console.log("No change detected for the collection", self._name);
  }

  return returnedValue;
};

/**
 * This method will add a custom migration function that will be associated with this collection.
 * The given function will be executed once. In order to control if the migration function should
 * be executed right away or after the automatic migration actions you should pass the executeNow
 * flag.
 *
 * @param name - name of the migration. this should be unique for this collectionand allow for
 *                history of done migrations.
 * @param migration - A function that will be registered as a migration on this collection.
 * @param executeNow - A flag that indicates if the migration should be executed right away.
 */
Mongo.Collection.prototype.addCustomMigration = function addCustomMigration(name, migration, executeNow) {
  var self = this;
  var uniqueName = self._name + '.' + name;

  if (!self._migrations.findOne({_id: uniqueName})) {
    self._migrations.insert({_id: uniqueName, state: 'registered'});
  }

  // saving the actual migration function memory
  self._migrations.customMigrations[uniqueName] = migration;

  if (executeNow)
    executeMigration(self._name + '.' + name);

};

/**
 * Run all the migrations that has not been executed already.
 */
Mongo.Collection.prototype.runMigrations = function () {
  this._migrations.find({ _id: { $regex: this._name + '.*' }, state: 'registered' }).forEach(function (doc) {
    executeMigration(doc.name);
  });
};

function validateCollection(collection) {
  if(collection) {
    var problem;
    var ss = collection.simpleSchema();
    var validator = ss.namedContext();

    collection.find().forEach(function (doc) {
      var docsId = doc._id;
      delete doc._id;

      if (!validator.validate(doc, {modifier: false})) {
        console.log('object with id', docsId, 'is not valid. trying to migrate..');
        var unsetObject = {};

        _.forEach(validator.invalidKeys(), function (invalidKey) {

          if ((invalidKey.type === 'keyNotInSchema') &&
                !findInKeyHierarchy(invalidKey.name, unsetObject))
            unsetObject[invalidKey.name] = 1;

          else if (invalidKey.type === 'required' &&
              ( ss.schema()[invalidKey.name].defaultValue === undefined &&
                ss.schema()[invalidKey.name].autoValue === undefined )) {

            console.log('missing required key', invalidKey.name, 'on document',
                          docsId,'and there is no default value or auto value set');
            problem = true;

          } else
            console.log(invalidKey.name, invalidKey.type);
        });

        if (!problem) {
          collection.update(docsId,
            {'$unset': unsetObject},
            {validate: false, filter: false});
          collection.update(docsId, {$set: ss.clean(doc)});

          console.log('Updated document', docsId, 'to a valid object');
        }

      } else {
        //console.info("The object with id", docsId, "is valid");
      }
    });
  }

  return !problem && !!collection;
}

function executeMigration(id) {
  var migrations = Mongo.Collection.prototype._migrations;

  var migrationEntry = migrations.findOne({_id: id, state: 'registered'});
  if (migrationEntry)
    migrations.customMigrations[id]();

  migrations.update({_id: id}, {$set: {state: 'done'}})
}

function findInKeyHierarchy(keyToFind, object) {
  return _.find(_.keys(object), function (currentKey) {
    var keySplitToLevels = keyToFind.split('.');
    var currentLevel = '';

    for (var keyLevel in keySplitToLevels) {
      currentLevel = currentLevel === '' ? keySplitToLevels[keyLevel] : currentLevel + '.' + keySplitToLevels[keyLevel];
      if (currentKey === currentLevel) return true;
    }

    return false;
  });
}