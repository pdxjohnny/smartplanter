import { Sync } from 'tinylib/core';

class PlanterSync extends Sync {
  set(resource, preprocessed) {
    return new Promise(function(resolve, reject) {
      this.set_reponse(resource, resolve, reject)();
    }.bind(this));
  }
  set_reponse(resource, resolve, reject) {
    // XXX Mixed content policy only allows passive resources to load over HTTP
    // requests. This is a way we can circumvent that policy by requesting a
    // "passive resource", an Image load, which the server running on the
    // planter will accept and use the parameters to connect to WiFi.
    // https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content
    var resolved = false;
    const found = function() {
      if (resolved === false) {
        resolved = true;
        resolve(resource);
      }
    }.bind(this);
    const bound = function() {
      if (resource.skipped) {
        return found();
      }
      setTimeout(function() {
        bound(resource, resolve, reject);
      }.bind(this), 5000);
      var image = new Image();
      image.onerror = function() {
        if (resource.skipped) {
          return found();
        }
        setTimeout(function() {
          bound(resource, resolve, reject);
        }.bind(this), 5000);
      }.bind(this);
      image.onload = function() {
        found();
      }.bind(this);
      image.src = this.value + '/apiwifisave?s={0}&p={1}&t={2}&r={3}'.format(
          resource.value.SSID, resource.value.password, resource.value.token,
          String(Math.random()));
    }.bind(this);
    return bound;
  }
}

export default PlanterSync;
