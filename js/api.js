class SmartPlanterAPI {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }
  createuser() {
    var array = new Uint32Array(50);
    window.crypto.getRandomValues(array);
    var password = btoa(array);
    return fetch(this.endpoint + '/createuser/?password=' + password)
    .then(function(response) {
      return response.text()
      .then(function(text) {
        try {
          return JSON.parse(text);
        } catch (err) {
          throw new Error(text);
        }
      }.bind(this))
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
      userdata.password = password;
      return userdata;
    }.bind(this));
  }
  login(userID, password) {
    return fetch(this.endpoint + '/login/?id={0}&password={1}'.format(
          userID, password))
    .then(function(response) {
      return response.text()
      .then(function(text) {
        try {
          return JSON.parse(text);
        } catch (err) {
          throw new Error(text);
        }
      }.bind(this))
    }.bind(this))
    .then(function(userdata) {
      if (typeof userdata['token'] === 'undefined') {
        throw new Error('No token in login response {0}'.format(userdata));
      }
      return userdata;
    }.bind(this));
  }
  get(token, resourceID) {
    if (typeof resourceID === 'undefined') {
      return Promise.resolve(null);
    }
    return fetch(this.endpoint + '/sync/?resource=' + resourceID, {
      headers: {
        'Authorization': 'Bearer ' + token
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
    }.bind(this))
  }
  set(token, resourceID, data) {
    var method = 'PUT';
    var url = this.endpoint + 'sync/';
    if (typeof resourceID === 'undefined') {
      method = 'POST';
    } else {
      url += '?resource=' + resourceID;
    }
    return fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + token
      },
      method: method,
      body: data,
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
    }.bind(this))
  }
}
