docute.init({
  landing: true,
  tocVisibleDepth: 2,
  repo: 'service-mocker/service-mocker',
  'edit-link': 'https://github.com/service-mocker/service-mocker/blob/master/docs',
  nav: [{
    title: 'Getting Started',
    path: '/home',
  }, {
    title: 'API Reference',
    path: '/api',
  }, {
    title: 'Caveats',
    path: '/caveats',
  }],
  plugins: [
    landingScriptsPlugin([
      'https://cdn.jsdelivr.net/npm/webfontloader@latest',
      'assets/twitter-widget.js',
      'assets/stroke.js',
    ]),
    footerPlugin(),
  ],
});

function landingScriptsPlugin(scripts) {
  var caches = {};

  return function loadScripts(context) {
    context.router.afterEach(function (to) {
      if (to.meta && to.meta.name === 'landing') {
        scripts.forEach(function (url) {
          if (caches[url]) {
            caches[url].parentElement.removeChild(caches[url]);
          }

          var el = caches[url] = document.createElement('script');
          el.src = url; el.async = false;
          document.body.appendChild(el);
        });
      }
    });
  };
}

function footerPlugin() {
  var footer = [
    '<footer id="page-footer">',
    '<span><a href="https://github.com/service-mocker">Service Mocker Team</a> &copy;2017.</span>',
    '<span>Proudly published with <a href="https://github.com/egoist/docute" target="_blank">docute</a>.</span>',
    '</footer>',
  ].join('');

  return function appendFooter(context) {
    context.registerComponent('content:end', {
      template: footer,
    });
  };
}
