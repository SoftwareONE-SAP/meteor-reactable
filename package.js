Package.describe({
  name: 'reactable',
  version: '0.0.1',
  summary: 'A library for displaying reactive data in a HTML table',
  git: 'https://github.com/Centiq/meteor-reactable',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');

  api.use([
    'react',
    'react-meteor-data',
    'react-template-helper',
    'templating',
  ]);

  api.addFiles([
    'template.html',
    'helpers.jsx',
  ], 'client');

});
