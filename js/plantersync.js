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
    const bound = function() {
      var image = new Image();
      image.onerror = function() {
        // TODO Figure out when we need to set timeout and when the browser will
        // automaticly request it again
        setTimeout(bound(resource, resolve, reject), 100);
      }.bind(this);
      image.onload = function() {
        resolve(resource);
      }.bind(this);
      image.src = this.value + '/apiwifisave?s={0}&p={1}&t={2}'.format(
          resource.value.SSID, resource.value.password, resource.value.token);
    }.bind(this);
    return bound;
  }
}
