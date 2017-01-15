self.$config = {
  landing: true,
  tocVisibleDepth: 2,
  nav: [{
    title: 'Getting Started',
    path: '/home',
  }, {
    title: 'API Reference',
    path: '/api',
  }],
  plugins: [
    landingScriptsPlugin([
      'https://unpkg.com/webfontloader@latest',
      'assets/twitter-widget.js',
      'assets/stroke.js',
    ]),
  ],
};

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
