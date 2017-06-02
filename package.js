Package.describe({
  name: 'centiq:reactable',
  version: '0.1.4',
  summary: 'A library for displaying reactive data in a HTML table',
  git: 'https://github.com/Centiq/meteor-reactable',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.4.4');
  api.use('ecmascript');

  api.use([
    'react-template-helper@0.2.9',
    'templating',
    'reactive-var',
  ], 'client');

  api.addFiles([
    'template.html',
    'helpers.js',
  ], 'client');

  api.addFiles([
    'lib/DefaultStateManager.js',
    'lib/PropTypes.js',
    'lib/mixins/ReactableClasses.js',
    'lib/mixins/ReactMeteorData.js',
    'lib/components/Reactable.js',
    'lib/components/ReactableState.js',
    'lib/components/ReactableData.js',
    'lib/components/ReactableUI.js',
    'lib/components/ReactableTable.js',
    'lib/components/ReactableTableHead.js',
    'lib/components/ReactableTableHeadCell.js',
    'lib/components/ReactableTableRow.js',
    'lib/components/ReactableTableCell.js',
    'lib/components/ReactableNavigation.js',
  ], 'client');

  api.addFiles([
    'lib/Publisher.js',
  ], 'server');

  api.export('Reactable');

});
