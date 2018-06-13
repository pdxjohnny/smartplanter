import { App, Loading, Notify } from 'tinylib/ui';
import PlanterSync from './plantersync.js';
import { PlanterDict, PlanterList } from './planter.js';
import PostSync from './postsync.js';
import cCSS from '../node_modules/simple-jscalendar/source/jsCalendar.min.css';
import AppCSS from '../css/app.css';

class SmartPlanter extends App {
  constructor(element) {
    super(element);
    this.plantersync = new PlanterSync([this.localstorage], 'plantersync',
        this.processors.pre, this.processors.post, [], {}, 'http://10.0.1.1');
    this.postsync = new PostSync([this.localstorage], 'poststorage',
        this.processors.pre, this.processors.post,
        [this.localstorage], {}, location.href + 'api/')
    this.api = this.postsync.api;
    this.sync.push(this.postsync);
    this.swreg = null;
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
      return this.mainview(this.MainView);
    }.bind(this))
    .then(function() {
      return this.registerSW();
    }.bind(this))
    .then(function() {
      return this.askPermission();
    }.bind(this))
    .then(function() {
      return this.subscribeUserToPush();
    }.bind(this));
  }
  registerSW() {
    if (this.swreg !== null) {
      return Promise.resolve(this.swreg);
    }
    return navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      this.swreg = registration;
      return this.swreg;
    }.bind(this));
  }
  askPermission() {
    return new Promise(function(resolve, reject) {
      const permissionResult = Notification.requestPermission(function(result) {
        resolve(result);
      });
      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    })
    .then(function(permissionResult) {
      if (permissionResult !== 'granted') {
        throw new Error('We weren\'t granted permission.');
      }
    });
  }
  subscribeUserToPush() {
    return this.registerSW()
    .then(function(registration) {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BIKNSok_laLAfu2NBZjzt9fuqNM3bI_263bwXuIl7lhKrDaox-cxVRuRpF1xLFcvzwZ0N2_yp0a_MUT3jqC9IUc'
        )
      };

      return registration.pushManager.subscribe(subscribeOptions);
    }.bind(this))
    .then(function(pushSubscription) {
      console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
      var sub = JSON.parse(JSON.stringify(pushSubscription));
      return this.postsync.authenticated()
      .then(function() {
        return this.api.update_push(sub.endpoint, sub.keys.p256dh, sub.keys.auth);
      }.bind(this))
    }.bind(this));
  }
  urlBase64ToUint8Array(base64String) {
    // From https://github.com/GoogleChromeLabs/web-push-codelab/raw/e4ad9f994c0fde1c3bd661877a7604a46e475c91/app/scripts/main.js
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

window.addEventListener('load', function() {
  var app = new SmartPlanter(document.getElementById('app'));
  // TODO Remove this
  window.app = app;
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
