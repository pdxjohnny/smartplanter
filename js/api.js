class SmartPlanterAPI {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.token = undefined;
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
  createplanter() {
    return fetch(this.endpoint + '/createplanter/', {
      headers: {
        'Authorization': 'Bearer ' + this.token
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
    .then(function(data) {
      if (typeof data['id'] === 'undefined') {
        throw new Error('No id in createplanter response {0}'.format(
              JSON.stringify(data)));
      }
      if (typeof data['token'] === 'undefined') {
        throw new Error('No token in createplanter response {0}'.format(
              JSON.stringify(data)));
      }
      return data;
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
  get(resourceID) {
    if (typeof resourceID === 'undefined') {
      return Promise.resolve(null);
    }
    return fetch(this.endpoint + '/sync/?resource=' + resourceID, {
      headers: {
        'Authorization': 'Bearer ' + this.token
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
  set(resourceID, data) {
    var method = 'PUT';
    var url = this.endpoint + 'sync/';
    if (typeof resourceID === 'undefined') {
      method = 'POST';
    } else {
      url += '?resource=' + resourceID;
    }
    console.log('api.set', resourceID, method, data);
    return fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + this.token
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
  update_push(endpoint, public_key, auth_token) {
    var url = this.endpoint + 'push/';
    console.log('api.update_push', endpoint, public_key, auth_token);
    var data = 'endpoint={0}&public_key={1}&auth_token={2}'.format(
        endpoint, public_key, auth_token);
    return fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + this.token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
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
