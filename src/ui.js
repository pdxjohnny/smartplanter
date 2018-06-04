import { JSONProcessor, LocalStorageSync } from './core.js';

class Notify {
  constructor(app, element, timeout) {
    if (typeof timeout === 'undefined') {
      timeout = 2000;
    }
    this.element = element;
    this.timeout = timeout;
    this.queue = [];
    this.visable = false
    this.processing = false;
    this.timer = undefined;
  }
  send(msg) {
    this.process({
      text: msg,
      color: 'rgba(107, 227, 232, 0.05)'
    });
  }
  error(msg) {
    this.process({
      text: msg,
      color: 'rgba(231, 109, 105, 0.05)'
    });
  }
  process(msg) {
    if (msg === undefined) {
      return;
    }
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
    }
    this.element.innerText = msg.text;
    this.element.style.marginBottom = '0px';
    this.element.style.display = 'block';
    this.element.style.textAlign = 'center';
    this.element.style.backgroundColor = msg.color;
    this.timer = setTimeout(function() {
      this.element.style.display = 'none';
    }.bind(this), this.timeout);
  }
  clear() {
    this.element.style.display = 'none';
  }
}

class View {
  constructor(app, element, resource) {
    this.app = app;
    this.element = element;
    this.resource = resource;
    if (typeof this.element !== 'undefined') {
      this.element.onkeyup = this.onkeyup.bind(this);
    }
  }
  onkeyup() {}
  reload() {
    this.div = document.createElement('div');
    this.element.innerHTML = '';
    this.element.appendChild(this.div);
    return this.div;
  }
  appendResourceValue(resource, div) {
    if (typeof resource.value === 'object' &&
        typeof resource.label === 'object') {
      for (var prop in resource.value) {
        var desc = document.createElement('p');
        div.appendChild(desc);
        if (typeof resource.value[prop] !== 'undefined' &&
            typeof resource.label[prop] !== 'undefined') {
          desc.innerText = resource.label[prop].format(
              resource.value[prop]);
        }
      }
    } else {
      var desc = document.createElement('p');
      div.appendChild(desc);
      desc.innerText = resource.value;
    }
  }
}

class List extends View {
  constructor(app, element, resource, listel, empty) {
    super(app, element);
    if (typeof empty === 'string') {
      this.empty = empty;
    } else {
      this.empty = 'Nothing to see here...';
    }
    this.resource = resource;
    this.resource.register(this.reload.bind(this));
    this.resource.onempty(this.reload.bind(this));
    this.listel = listel;
    this.subs = {};
  }
  reload() {
    return this.list()
    .then(function(list) {
      this.element.innerText = '';
      if (Object.keys(list).length < 1) {
        this.element.appendChild(this.noItems());
      } else {
        this.element.style.textAlign = 'left';
      }
      var lastel = this.element;
      for (var key in list) {
        if (typeof this.subs[key] === 'undefined') {
          this.subs[key] = new this.listel(this.app,
              document.createElement('div'),
              list[key]);
        }
        var listel = this.subs[key];
        list[key].oneshot(this.reload.bind(this));
        listel.reload();
        listel.element.onload = function() {
          lastel.element.scrollIntoView();
        }
        this.element.appendChild(listel.element);
      }
    }.bind(this));
  }
  list() {
    return Promise.resolve(this.resource.subvalue);
  }
  noItems() {
    var noItems = document.createElement('h2');
    noItems.className = 'mui-panel';
    noItems.style.textAlign = 'center';
    noItems.innerText = this.empty;
    return noItems;
  }
}

class Checkbox extends View {
  constructor(labelText, className, checked, unchecked) {
    super(undefined, document.createElement('div'), undefined);
    this.inputId = String(Math.random());
    this.input = document.createElement('input');
    this.label = document.createElement('label');
    this.input.setAttribute('id', this.inputId);
    this.label.setAttribute('for', this.inputId);
    this.label.innerText = labelText;
    this.element.appendChild(this.input);
    this.element.appendChild(this.label);
    this.element.className = className;
    this.input.setAttribute('type', 'checkbox');
    this.input.onchange = function(event) {
      if (this.input.checked && typeof checked === 'function') {
        checked();
      } else if (typeof unchecked === 'function') {
        unchecked();
      }
    }.bind(this);
  }
}

class Input extends View {
  constructor(resource, propName, labelText, className, typeName) {
    super(resource.app, undefined);
    if (typeof typeName === 'undefined') {
      typeName = 'text';
    }
    this.resource = resource;
    this.inputId = String(Math.random());
    this.element = document.createElement('div');
    this.input = document.createElement('input');
    this.label = document.createElement('label');
    this.input.setAttribute('id', this.inputId);
    this.label.setAttribute('for', this.inputId);
    this.label.innerText = labelText;
    this.element.appendChild(this.input);
    this.element.appendChild(this.label);
    this.element.className = className;
    this.input.setAttribute('type', typeName);
    this.input.onchange = function(event) {
      var value = JSON.parse(JSON.stringify(this.resource.value));
      if (typeof typeName !== 'undefined' && typeName === 'checkbox') {
        value[propName] = event.target.checked;
      } else if (propName === 'name') {
        this.resource.name = event.target.value;
      } else {
        value[propName] = event.target.value;
      }
      setTimeout(function() {
        this.resource.update(value);
      }.bind(this), 0);
    }.bind(this);
    if (typeof typeName !== 'undefined' && typeName === 'checkbox') {
      this.input.checked = this.resource.value[propName];
    } else if (propName === 'name') {
      if (typeof this.resource.name === 'string') {
        this.input.value = this.resource.name;
      } else {
        this.input.value = '';
      }
    } else {
      this.input.value = this.resource.value[propName];
    }
  }
}

class Button {
  constructor(text, className) {
    this.element = document.createElement('button');
    this.element.innerText = text;
    this.element.className = className;
  }
}

class Listel extends View {
  constructor(app, element, resource, modal) {
    super(app, element, resource);
    this.modal = modal;
  }
  reload() {
    var div = super.reload();
    div.dismissed = function() {};
    div.className = 'mui-panel';
    var title = document.createElement('h2');
    div.appendChild(title);
    title.innerText = this.resource.name;
    this.appendResourceValue(this.resource, div);
    if (typeof this.modal !== 'undefined') {
      div.onclick = function(event) {
        var modal = new this.modal(this.app,
            document.createElement('div'), this.resource);
        modal.reload();
        this.app.popup(modal.element);
      }.bind(this);
    }
    return div;
  }
}

class App {
  constructor(element) {
    this.popedup = null;
    this.element = element;
    this.jsonp = new JSONProcessor();
    this.processors = {
      'pre': [this.jsonp],
      'post': [this.jsonp]
    };
    this.localstorage = new LocalStorageSync([], 'localstorage',
        this.processors.pre, this.processors.post);
    this.sync = [this.localstorage];
  }
  popup(element, isstatic) {
    var modal = document.createElement('div');
    modal.className = 'mui-container-fluid';

    var container = document.createElement('div');
    container.className = 'mui-panel';

    container.style.position = 'absolute';
    container.style.top = '80px';
    container.style.left = '20px';
    container.style.right = '20px';

    container.appendChild(element);
    modal.appendChild(container);

    this.notify.clear();
    if (typeof isstatic === 'undefined') {
      isstatic = false;
    }

    modal.setAttribute('id', 'mui-overlay');
    modal.setAttribute('tabindex', '-1');
    modal.onclick = function(event) {
      if (event.target.id === 'mui-overlay' && isstatic === false) {
        this.popdown();
      }
    }.bind(this);
    this.popedup = modal;
    document.body.appendChild(this.popedup);
  }
  popdown() {
    if (this.popedup === null) {
      return;
    }
    document.body.removeChild(this.popedup);
  }
  mainview(view) {
    for (var child = 0; child < this.element.children.length; ++child) {
      this.element.children[child].style.display = 'none';
    }
    this.element.innerText = '';
    this.element.appendChild(view.element);
    console.log('Main View is now', view);
    for (var child = 0; child < this.element.children.length; ++child) {
      this.element.children[child].style.display = 'block';
    }
  }
}

class Loading extends View {
  constructor(app, title, element) {
    super(app, element);
    this.title = title;
    this.element = document.createElement('div');
    this.loader = this.regen();
    this.element.appendChild(this.loader);
  }
  changeTitle(title) {
  	this.title = title;
  	return this.reload();
  }
  reload() {
    this.element.removeChild(this.loader);
    this.loader = this.regen();
    this.element.appendChild(this.loader);
  }
  regen() {
    var div = document.createElement('div');
    for (var className of ['tl-loading-circle', 'tl-loading-circle-small',
        'tl-loading-circle-big', 'tl-loading-circle-inner-inner',
        'tl-loading-circle-inner']) {
      var child = document.createElement('div');
      child.className = className;
      div.appendChild(child);
    }
    if (typeof this.title !== 'undefined') {
      var title = document.createElement('center');
      title.className = 'tl-loading-title';
      title.innerText = this.title;
      div.appendChild(title);
    }
    return div;
  }
}

export {
  Notify,
  View,
  List,
  Checkbox,
  Input,
  Button,
  Listel,
  App,
  Loading
};