class SmartPlanter extends App {
  constructor(element) {
    super(element);
    this.sync.push(new PostSync([this.localstorage], 'poststorage',
        this.processors.pre, this.processors.post,
        [this.localstorage], {}, location.href + 'api/'));
  }
  DOMLoaded() {
    this.loading = new Loading(this, 'Loading...');
    this.mainview(this.loading);
    this.MainView = {
      name: 'mainview',
      element: document.getElementById('mainview')
    };
    this.notify = new Notify(this, document.getElementById('notify'));
    this.planters = new PlanterDict(this.sync, 'planters')
    this.planter_list = new PlanterList(this,
        document.getElementById('planter_list'),
        document.getElementById('planter_add'),
        this.planters);
    return this.planters.query()
    .then(function() {
      this.mainview(this.MainView);
    }.bind(this));
  }
}

window.addEventListener('load', function() {
  var app =  new SmartPlanter(document.getElementById('app'));
  app.DOMLoaded();
});

var assets = Array.from(document.head.querySelectorAll('link')).map(function(element) {
  return element.href.replace(location.href, '');
}).filter(function(link) {
  var split = link.split('/');
  if (!split.length) {
    return false;
  }
  return split[split.length - 1].indexOf('.') !== -1;
}).concat(Array.from(document.head.querySelectorAll('script')).map(function(element) {
  return element.src.replace(location.href, '');
}));
/*
UpUp.start({
 'cache-version': 'v0',
 'content-url': location.href + 'index.html',
 'service-worker-url': location.href + 'upup.sw.min.js',
 'assets': assets
});
*/
