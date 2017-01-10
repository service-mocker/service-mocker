self.$config = {
  landing: true,
  debug: true,
  plugins: [
    landingScriptsPlugin([
      'https://unpkg.com/webfontloader@latest',
      'assets/stroke.js',
    ]),
  ],
};

function landingScriptsPlugin(scripts) {
  return function loadScripts(context) {
    context.router.afterEach(function (to) {
      if (to.meta && to.meta.name === 'landing') {
        scripts.forEach(function (url) {
          var el = document.createElement('script');
          el.src = url;
          el.async = false;
          document.body.appendChild(el);
        });
      }
    });
  };
}
