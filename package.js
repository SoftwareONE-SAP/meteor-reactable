Package.describe({
  name: 'centiq:reactable',
  version: '0.0.1',
  summary: 'A library for displaying reactive data in a HTML table',
  git: 'https://github.com/Centiq/meteor-reactable',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');

  api.use('react@=0.1.0');

  api.use([
    'react-meteor-data@=0.1.5',
    'react-template-helper@=0.1.2',
    'templating',
  ], 'client');

  api.addFiles([
    'template.html',
    'helpers.jsx',
  ], 'client');

  api.addFiles([
    'lib/DefaultStateManager.jsx',
    'lib/PropTypes.jsx',
    'lib/mixins/ReactableClasses.jsx',
    'lib/components/Reactable.jsx',
    'lib/components/ReactableState.jsx',
    'lib/components/ReactableData.jsx',
    'lib/components/ReactableUI.jsx',
    'lib/components/ReactableTable.jsx',
    'lib/components/ReactableTableHead.jsx',
    'lib/components/ReactableTableHeadCell.jsx',
    'lib/components/ReactableTableRow.jsx',
    'lib/components/ReactableTableCell.jsx',
    'lib/components/ReactableNavigation.jsx',
  ], 'client');

  api.addFiles([
    'lib/Publisher.jsx',
  ], 'server');

  api.export('Reactable');

});
