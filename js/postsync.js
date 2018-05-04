class PostSync extends Sync {
  constructor(sync, name, pre, post, relay, meta, value) {
    super(sync, name, pre, post, relay, meta, value);
    this.api = new SmartPlanterAPI(this.value);
    this.token = new Resource(this.sync, this.value + 'postsync.token', 'postsync.token');
    this.id = new Resource(this.sync, this.value + 'postsync.id', 'postsync.id');
    this.password = new Resource(this.sync, this.value + 'postsync.password', 'postsync.password');
  }
  register(resource) {
    return this.api.createuser()
    .then(function(userdata) {
      return this.id.update(userdata.id)
      .then(function() {
        return this.token.update(userdata.token);
      }.bind(this))
      .then(function() {
        return this.password.update(userdata.password)
      }.bind(this));
    }.bind(this));
  }
  login(resource) {
    return this.id.queryPrimary()
    .then(function() {
      return this.password.queryPrimary();
    }.bind(this))
    .then(function() {
      return this.api.login(this.id.value, this.password.value)
    }.bind(this))
    .then(function(userdata) {
      this.token.update(userdata.token);
      return userdata;
    }.bind(this));
  }
  authenticated() {
    return Promise.all([this.id.queryPrimary(), this.token.queryPrimary()])
    .then(function() {
      if (this.id.value === undefined) {
        return this.register();
      }
      if (this.token.value === undefined) {
        return this.login();
      }
      return Promise.resolve();
    }.bind(this))
    .then(function() {
      this.api.token = this.token.value;
    }.bind(this));
  }
  _load_id() {
    return this.id.queryPrimary()
    .then(this.id_loaded.bind(this));
  }
  _load_token() {
    return this.token.queryPrimary()
    .then(this.token_loaded.bind(this));
  }
  id_loaded() {
    const finish = function(res) {
      console.log('this.id.value', this.id.value);
      return Promise.resolve(res);
    }.bind(this);
    if (this.id.value === undefined) {
      return this.register()
      .then(finish)
    }
    return finish(this.id);
  }
  token_loaded() {
    const finish = function(res) {
      console.log('this.token.value', this.token.value);
      this.api.token = this.token.value;
      return Promise.resolve(res);
    }.bind(this);
    if (this.token.value === undefined) {
      return this.login()
      .then(finish)
    }
    return finish(this.token);
  }
  get(resource) {
    return this.authenticated()
    .then(function() {
      return this._get(resource);
    }.bind(this))
    .then(function(value) {
      return this.postprocess(resource, value);
    }.bind(this));
  }
  set(resource, value) {
    return this.authenticated()
    .then(function() {
      return this.preprocess(resource, value);
    }.bind(this))
    .then(function(preprocessed) {
      return this._set(resource, preprocessed);
    }.bind(this));
  }
  _get(resource) {
    // console.log('PostSync.get', resource.name, resource.meta, this.token.value);
    return this.api.get(resource.meta[this.value + '.id']);
  }
  _set(resource, preprocessed) {
    var meta = JSON.parse(JSON.stringify(resource.meta));
    console.log('PostSync.set', resource.name, meta, preprocessed);
    if (typeof meta[this.value + '.id'] === 'undefined') {
      return resource._syncget(this.relay)
      .then(this._do_set(resource, meta, preprocessed));
    }
    return this._do_set(resource, meta, preprocessed)();
  }
  _do_set(resource, meta, preprocessed) {
    return function() {
      return this.api.set(meta[this.value + '.id'],
          preprocessed)
      .then(function(response) {
        resource.meta = Object.assign(meta, resource.meta);
        if (typeof response['id'] !== 'undefined') {
          resource.meta[this.value + '.id'] = response.id;
          // Update the resource in localstorage to save the meta
          resource._update(this.relay, resource.value)
          .then(function() {
            console.log('PostSync updated resource.meta:', resource.name, resource.meta);
          }.bind(this));
        }
        return resource;
      }.bind(this));
    }.bind(this);
  }
}
