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
    return window.crypto.subtle.generateKey({
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),  // Equivalent to 65537,
        hash: 'SHA-512'
      },
      true,
      ['sign']
    )
    .then(function(key) {
      var signThis = 'signed data here!';
      return Promise.all([
          Promise.resolve(signThis),
          window.crypto.subtle.sign('RSASSA-PKCS1-v1_5', key.privateKey,
            asciiToUint8Array(signThis)),
          window.crypto.subtle.exportKey('spki', key.publicKey),
      ]);
    }.bind(this))
    .then(function(data_signature_publicKey) {
      var send = {
        data: data_signature_publicKey[0],
        signature: btoa(arrayBufferToString(data_signature_publicKey[1])),
        publicKey: spkiToPEM(data_signature_publicKey[2])
      };
      console.log(send);
      return fetch(location.origin + '/api/verify/', {
        method: 'POST',
        body: JSON.stringify(send)
      });
    }.bind(this))
    .then(function(response) {
      return response.text();
    }.bind(this))
    .then(function(text) {
      console.log(text);
    }.bind(this))
    /*
    .then(function() {
      return this.registerSW()
    }.bind(this))
    .then(function() {
      return this.mainview(this.MainView);
    }.bind(this))
    */
  }
  registerSW() {
    return Promise.resolve(null);
    if (this.swreg !== null) {
      return Promise.resolve(this.swreg);
    }
    return navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      this.swreg = registration;
      return this.swreg;
    }.bind(this));
  }
}


function spkiToPEM(keydata){
    var keydataS = arrayBufferToString(keydata);
    var keydataB64 = window.btoa(keydataS);
    var keydataB64Pem = formatAsPem(keydataB64);
    return keydataB64Pem;
}

function arrayBufferToString( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return binary;
}


function formatAsPem(str) {
    var finalString = '-----BEGIN PUBLIC KEY-----\n';

    while(str.length > 0) {
        finalString += str.substring(0, 64) + '\n';
        str = str.substring(64);
    }

    finalString = finalString + "-----END PUBLIC KEY-----";

    return finalString;
}


function asciiToUint8Array(str)
{
  var chars = [];
  for (var i = 0; i < str.length; ++i) {
    chars.push(str.charCodeAt(i));
  }
  return new Uint8Array(chars);
}


window.addEventListener('load', function() {
  var app = new SmartPlanter(document.getElementById('app'));
  window.app = app;
  app.DOMLoaded();
});
