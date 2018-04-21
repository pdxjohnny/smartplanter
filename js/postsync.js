class PostSync extends Sync {
  constructor(sync, name, pre, post, relay, meta, value) {
    super(sync, name, pre, post, relay, meta, value);
    this.token = new Resource(this.sync, this.value + 'postsync.token', 'postsync.token');
    this.id = new Resource(this.sync, this.value + 'postsync.id', 'postsync.id');
    this.password = new Resource(this.sync, this.value + 'postsync.password', 'postsync.password');
  }
  register(resource) {
    var array = new Uint32Array(50);
    window.crypto.getRandomValues(array);
    var password = btoa(array);
    console.warn('Registration password', password);
    return this.password.update(password)
    .then(function() {
      return fetch(this.value + '/createuser/?password=' + password);
    }.bind(this))
    .then(function(response) {
      return response.json();
    }.bind(this))
    .then(function(userdata) {
      if (typeof userdata['id'] === 'undefined') {
        throw new Error('No id in register response {0}'.format(
              JSON.stringify(userdata)));
      }
      if (typeof userdata['token'] === 'undefined') {
        throw new Error('No token in register response {0}'.format(
              JSON.stringify(userdata)));
      }
      return this.id.update(userdata.id)
      .then(function() {
        return this.token.update(userdata.token);
      }.bind(this));
    }.bind(this));
  }
  login(resource) {
    return this.id.queryPrimary()
    .then(function() {
      return this.password.queryPrimary();
    }.bind(this))
    .then(function() {
      return fetch(this.value + '/login/?id={0}&password={1}'.format(
          this.id.value, this.password.value))
    }.bind(this))
    .then(function(response) {
      return response.json();
    }.bind(this))
    .then(function(userdata) {
      if (typeof userdata['token'] === 'undefined') {
        throw new Error('No token in login response {0}'.format(userdata));
      }
      this.token.update(userdata.token);
      return userdata;
    }.bind(this));
  }
  authenticated() {
    if (this.id.value === undefined) {
      return this._load_id();
    } else if (this.token.value === undefined) {
      return this._load_token();
    }
    return Promise.resolve();
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
    }.bind(this));
  }
  set(resource, preprocessed) {
    return this.authenticated()
    .then(function() {
      return this._set(resource, preprocessed);
    }.bind(this));
  }
  _get(resource) {
    // console.log('PostSync.get', resource.name, resource.meta, this.token.value);
    if (typeof resource.meta[this.value + '.id'] === 'undefined') {
      return Promise.resolve(null);
    }
    return fetch(this.value + '/sync/?resource=' +
        resource.meta[this.value + '.id'], {
      headers: {
        'Authorization': 'Bearer ' + this.token.value
      }
    })
    .then(function(response) {
      return response.text()
      .then(function(text) {
        try {
          return JSON.parse(text);
        } catch (err) {
          throw new Error(text);
        }
      }.bind(this))
      return response.json();
    }.bind(this))
  }
  _set(resource, preprocessed) {
    var meta = JSON.parse(JSON.stringify(resource.meta));
    // console.log('PostSync.set', resource.name, meta, this.token.value);
    if (typeof meta[this.value + '.id'] === 'undefined') {
      return resource._syncget(this.relay)
      .then(this._do_set(resource, meta, preprocessed));
    }
    return this._do_set(resource, meta, preprocessed)();
  }
  _do_set(resource, meta, preprocessed) {
    return function() {
      var method = 'PUT';
      var url = this.value + 'sync/';
      if (typeof meta[this.value + '.id'] === 'undefined') {
        method = 'POST';
      } else {
        url += '?resource=' + meta[this.value + '.id'];
      }
      return fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + this.token.value
        },
        method: method,
        body: preprocessed,
      })
      .then(function(response) {
        return response.text()
        .then(function(text) {
          try {
            if (method === 'POST') {
              console.warn('PostSync set', resource.name, method, 'response:', text);
            } else {
              console.log('PostSync set', resource.name, method, 'response:', text);
            }
            return JSON.parse(text);
          } catch (err) {
            throw new Error(text);
          }
        }.bind(this))
        return resource;
      }.bind(this))
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
