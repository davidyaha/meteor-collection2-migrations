/**
 * Created by David Yahalomi on 9/27/15.
 */

class SchemaComparator {

  constructor() {
    var classConstructor = this[DeterminePackages.getSetup() + 'SchemaComparator']
    this.comparator = new classConstructor();
  }

  compareSchemas(newSchema, oldSchema) {
    return this.comparator.compareSchemas(newSchema, oldSchema);
  }

}