Package.describe({
  name: 'davidyaha:collection2-migrations',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use(['underscore', 'aldeed:collection2@2.3.3'], 'server');
  api.addFiles('collection2-migrations.js', 'server');
});

Package.onTest(function(api) {
  api.use(['aldeed:collection2', 'tinytest', 'test-helpers'], 'server');
  api.use('davidyaha:collection2-migrations', 'server');
  api.addFiles('collection2-migrations-tests.js', 'server');
});
