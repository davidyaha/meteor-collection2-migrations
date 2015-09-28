/**
 * Created by David Yahalomi on 9/27/15.
 */

class DeterminePackages {
  static getSetup () {

    if (!setup) {
      if (Mongo && typeof Mongo.Collection.attachSchema === 'function')
        setup = 'C2';

      // https://atmospherejs.com/jagi/astronomy
      else if (Astronomy)
        setup = 'Astronomy';
    }

    return setup;
  }

  static setSetup(newSetup) {
    // TODO: Add possible values
    setup = newSetup;
  }

  static var setup;
}