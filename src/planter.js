import jsCalendar from 'simple-jscalendar';
import { Resource, Dict } from './core.js';
import { View, Listel, List, Input, Button } from './ui.js';

class Planter extends Resource {
  constructor(sync, name, meta, value) {
    super(sync, name, 'planter', meta, value);
    if (typeof this.value !== 'object') {
      /* If a planter does not receive a configuration file, it will use default
       * settings. (V = 0, W = 0, X = 8, Y = 1, Z = 40)
       * timeStamp format: 58265 18-05-27 00:10:50 50 0 0  23.1 UTC(NIST) *
       */
      this.value = {
        vacationMode: false,
        vacationModeLength: 2,
        useFeritizer: false,
        moistureLowerBound: 40,
        daysBetweenWaters: -1,
        numberWatersInTank: -1,
        currentWatersInTank: -1,
        numberPumpRunsPerWater: -1,
        numberFertilizersInTank: -1,
        currentFertilizersInTank: -1,
        demoMode: true,
        demoFrequency: 5,
        moisture: -1,
        light: -1,
        moistureError: false,
        timeStamp: 'N/A'
      };
    }
    this.label = {
      vacationMode: 'Vacation Mode: {0}',
      vacationModeLength: 'Vacation Mode Length: {0} weeks',
      useFeritizer: 'Use Feritizer: {0}',
      moistureLowerBound: 'Moisture Sensor Lower Bound: {0}',
      daysBetweenWaters: 'Days Between Waters: {0}',
      numberWatersInTank: 'Number Waters In Tank: {0}',
      currentWatersInTank: 'Current Waters In Tank: {0}',
      numberPumpRunsPerWater: 'Number Pump Runs Per Water: {0}',
      numberFertilizersInTank: 'Number Fertilizers In Tank: {0}',
      currentFertilizersInTank: 'Current Fertilizers In Tank: {0}',
      demoMode: 'Demo Mode: {0}',
      demoFrequency: 'Demo Mode Frequency: Water every {0} seconds',
      moisture: 'Moisture: {0}%',
      light: 'Light: {0}',
      moistureError: 'Moisture Error: {0}',
      timeStamp: 'Last Water: {0}'
    };
  }
}

class PlanterDict extends Dict {
  constructor(sync, name, meta, value) {
    super(sync, name, 'planters', Planter, meta, value);
  }
}

class PlanterAdvancedOptions extends View {
  constructor(app, element, resource, back) {
    super(app, element, resource);
    this.back = back;
  }
  reload() {
    var div = super.reload();
    var center = document.createElement('center');
    div.appendChild(center);
    center.className = 'mui--align-middle';
    var title = document.createElement('h1');
    title.innerText = 'Advanced Options';
    center.appendChild(title);
    center.appendChild(document.createElement('br'));
    center.appendChild(new Input(this.resource, 'vacationMode', 'Vacation Mode',
          'mui-checkbox', 'checkbox').element);
    center.appendChild(document.createElement('br'));
    center.appendChild(new Input(this.resource, 'vacationModeLength',
          'Vacation Mode length in weeks', 'mui-textfield').element);
    center.appendChild(document.createElement('br'));
    center.appendChild(new Input(this.resource, 'useFeritizer', 'Use Ferilizer',
          'mui-checkbox', 'checkbox').element);
    var back = new Button('< Back', 'mui-btn mui-btn--raised');
    back.element.onclick = function(event) {
      this.back();
    }.bind(this);
    center.appendChild(back.element);
    return div;
  }
}

class PlanterDiagnostics extends View {
  constructor(app, element, resource, back) {
    super(app, element, resource);
    this.back = back;
  }
  reload() {
    var div = super.reload();
    var center = document.createElement('center');
    div.appendChild(center);
    center.className = 'mui--align-middle';
    var title = document.createElement('h1');
    title.innerText = 'Diagnostics';
    center.appendChild(title);
    center.appendChild(document.createElement('br'));
    center.appendChild(new Input(this.resource, 'demoMode',
          'Demo Mode', 'mui-checkbox', 'checkbox').element);
    center.appendChild(document.createElement('br'));
    center.appendChild(new Input(this.resource, 'demoFrequency',
          'Demo Frequency in seconds', 'mui-textfield', 'number').element);
    center.appendChild(document.createElement('br'));
    this.appendResourceValue(this.resource, div);
    center = document.createElement('center');
    div.appendChild(center);
    center.className = 'mui--align-middle';
    var back = new Button('< Back', 'mui-btn mui-btn--raised');
    back.element.onclick = function(event) {
      this.back();
    }.bind(this);
    center.appendChild(back.element);
    return div;
  }
}

class PlanterCalendar extends View {
  reload() {
    var div = super.reload();
    var desc = document.createElement('p');
    div.appendChild(desc);
    desc.innerText = 'Estimated watering schedule';
    var calEl = document.createElement('div');
    div.appendChild(calEl);
    calEl.className = 'auto-jsCalendar material-theme';
    console.log(jsCalendar);
    var cal = jsCalendar.new(calEl);
    const addDays = function(date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };
    const formatDate = function(date) {
      return ('0' + date.getDate()).slice(-2) + '/' +
        ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();
    };
    var today = new Date();
    if (this.resource.value.timeStamp !== 'N/A') {
      var lastWater = this.resource.value.timeStamp.split(' ')[1].split('-');
      lastWater[0] = '20' + lastWater[0];
      lastWater = [lastWater[1], lastWater[2], lastWater[0]].join('/');
      today = new Date(lastWater);
      console.log(lastWater, today);
      cal.select(formatDate(today));
    }
    if (this.resource.value.daysBetweenWaters < 1) {
      if (this.resource.value.moistureLowerBound <= 20) {
        this.resource.value.daysBetweenWaters = 14;
      } else if (this.resource.value.moistureLowerBound >= 60) {
        this.resource.value.daysBetweenWaters = 7;
      } else {
        this.resource.value.daysBetweenWaters = 10;
      }
    }
    for (var i = 0; i < 30; i++) {
      cal.select(formatDate(addDays(today,
              this.resource.value.daysBetweenWaters * Number(i))));
    }
    return div;
  }
}

class PlanterModal extends View {
  constructor(app, element, resource) {
    super(app, element, resource);
    this.cal = new PlanterCalendar(app,
        document.createElement('div'), resource);
    this.advanced = new PlanterAdvancedOptions(app,
        document.createElement('div'), resource, this.back.bind(this));
    this.diagnostics = new PlanterDiagnostics(app,
        document.createElement('div'), resource, this.back.bind(this));
  }
  reload() {
    var div = super.reload();
    this.cal.reload();
    this.advanced.reload();
    this.diagnostics.reload();
    div.user = this;
    div.dismissed = function() {};
    var center = document.createElement('center');
    div.appendChild(center);
    center.className = 'mui--align-middle';
    var title = document.createElement('h1');
    title.innerText = this.resource.name;
    center.appendChild(title);
    center.appendChild(this.cal.element);
    var arid = new Button('Arid', 'mui-btn mui-btn--fab');
    var semiarid = new Button('Semi', 'mui-btn mui-btn--fab');
    var tropical = new Button('Tropic', 'mui-btn mui-btn--fab');
    center.appendChild(arid.element);
    center.appendChild(semiarid.element);
    center.appendChild(tropical.element);
    center.appendChild(document.createElement('br'));
    const setClimate = function() {
      setTimeout(function() {
        for (var choice of [arid, semiarid, tropical]) {
          choice.element.className = choice.element.className.replace(' mui-btn--primary', '');
        }
        if (this.resource.value.moistureLowerBound <= 20) {
          arid.element.className += ' mui-btn--primary';
        } else if (this.resource.value.moistureLowerBound >= 60) {
          tropical.element.className += ' mui-btn--primary';
        } else {
          semiarid.element.className += ' mui-btn--primary';
        }
        this.cal.reload();
        this.resource.update(this.resource.value);
      }.bind(this), 0);
    }.bind(this);
    arid.element.onclick = function(event) {
      this.resource.value.moistureLowerBound = 20;
      this.resource.value.daysBetweenWaters = 14;
      setClimate();
    }.bind(this);
    semiarid.element.onclick = function(event) {
      this.resource.value.moistureLowerBound = 40;
      this.resource.value.daysBetweenWaters = 10;
      setClimate();
    }.bind(this);
    tropical.element.onclick = function(event) {
      this.resource.value.moistureLowerBound = 60;
      this.resource.value.daysBetweenWaters = 7;
      setClimate();
    }.bind(this);
    setClimate();
    var advanced = new Button('Advanced', 'mui-btn mui-btn--raised mui-btn--primary');
    advanced.element.onclick = function(event) {
      this.element.innerHTML = '';
      this.element.appendChild(this.advanced.element);
    }.bind(this);
    center.appendChild(advanced.element);
    var remove = new Button('Delete', 'mui-btn mui-btn--raised mui-btn--danger');
    remove.element.onclick = function(event) {
      this.app.planters.remove(this.resource.name);
      this.app.popdown();
    }.bind(this);
    center.appendChild(remove.element);
    center.appendChild(document.createElement('br'));
    var diagnostics = new Button('Diagnostics', 'mui-btn mui-btn--raised');
    diagnostics.element.onclick = function(event) {
      this.element.innerHTML = '';
      this.element.appendChild(this.diagnostics.element);
    }.bind(this);
    center.appendChild(diagnostics.element);
    this.center = center;
  }
  back() {
    this.element.innerHTML = '';
    this.element.appendChild(this.div);
  }
}

class PlanterSetup extends Resource {
  constructor(sync, name, meta, value) {
    super(sync, name, 'planter.setup', meta, value);
    if (typeof this.value !== 'object') {
      this.value = {
        plantername: '',
        SSID: '',
        password: '',
        token: ''
      };
    }
  }
  update(value) {
    if (typeof value !== 'object' ||
        typeof value.plantername !== 'string' ||
        typeof value.SSID !== 'string' ||
        typeof value.password !== 'string' ||
        typeof value.token !== 'string' ||
        value.plantername.length === 0 ||
        value.SSID.length === 0 ||
        value.password.length === 0 ||
        value.token.length === 0) {
      this.value = value;
      return Promise.resolve(this);
    }
    return super.update(value);
  }
}

class PlanterAddModal extends View {
  constructor(app, element, resource) {
    super(app, element);
    this.resource = resource;
  }
  reload() {
    var div = super.reload();
    div.user = this;
    div.dismissed = function() {};
    var center = document.createElement('center');
    div.appendChild(center);
    center.className = 'mui--align-middle';
    var title = document.createElement('h1');
    title.innerText = 'Add Planter';
    center.appendChild(title);
    center.appendChild(document.createElement('br'));
    var setup = new PlanterSetup([this.app.plantersync], 'setup');
    center.appendChild(
        new Input(setup, 'plantername', 'Planter\'s Name',
          'mui-textfield').element);
    center.appendChild(
        new Input(setup, 'SSID', 'SSID',
          'mui-textfield').element);
    var password = new Input(setup, 'password', 'Password', 'mui-textfield');
    password.input.setAttribute('type', 'password');
    password.input.setAttribute('autocomplete', 'new-password');
    center.appendChild(password.element);
    var next = new Button('Next', 'mui-btn mui-btn--primary');
    next.element.onclick = function(event) {
      // Request a new planter be created and a token signed from the server
      var _token = null;
      this.app.postsync.authenticated()
      .then(function() {
        return this.app.api.createplanter();
      }.bind(this))
      .then(function(token) {
        _token = token.token;
        var resource = new Planter(this.resource.sync,
            setup.value.plantername);
        resource.meta[this.app.postsync.value + '.id'] = token.id;
        return resource.update(resource.value);
      }.bind(this))
      .then(function(resource) {
        this.resource.add(resource.name, resource);
      }.bind(this))
      .then(function() {
        setup.value.token = _token;
        console.log('NEXT', setup.value);
        title = document.createElement('h1');
        title.innerText = 'Connect to SmartPlanter WiFi';
        center.innerHTML = '';
        center.appendChild(title);
        return setup.update(setup.value);
      }.bind(this))
      .then(function() {
        console.log('POPDOWN');
        this.app.popdown();
      }.bind(this));
    }.bind(this);
    center.appendChild(next.element);
    var cancel  = new Button('Cancel', 'mui-btn mui-btn--danger');
    cancel.element.onclick = function(event) {
      console.log('Cancel', setup.value);
      this.app.popdown();
    }.bind(this);
    center.appendChild(cancel.element);
    return div;
  }
}

class PlanterImageCreator {
  constructor() {
    this.loaded = false;
    this.callem = [];
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.img = new Image();
    this.img.onload = this.imgLoaded.bind(this);
    // Image data URI for icons/android-chrome-72x72.png
    this.img.src = 'data:image/png;base64,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';
  }
  imgLoaded() {
    this.loaded = true;
    for (var i = 0; i < this.callem.length; i++) {
      this.draw(this.img, this.callem[i]);
    }
    this.callem = [];
  }
  draw(img, resolve) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    var r = Math.floor(Math.random() * (255 - 1));
    var g = Math.floor(Math.random() * (255 - 1));
    var b = Math.floor(Math.random() * (255 - 1));
    for (var i = 0; i < data.length; i += 4) {
      if (data[i] >= (165 - 20) &&
          data[i] <= (165 + 20) &&
          data[i + 1] >= (198 - 20) &&
          data[i + 1] <= (198 + 20) &&
          data[i + 2] >= (61 - 20) &&
          data[i + 2] <= (61 + 20)) {
        data[i]     = r; // red
        data[i + 1] = g; // green
        data[i + 2] = b; // blue
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return resolve(canvas.toDataURL());
  }
  createImage() {
    return new Promise(function(resolve, reject) {
      if (this.loaded === false) {
        this.callem.push(resolve);
      } else {
        this.draw(this.img, resolve);
      }
    }.bind(this));
  }
}

const PlanterImage = new PlanterImageCreator();

class PlanterListel extends Listel {
  constructor(app, element, resource) {
    super(app, element, resource, PlanterModal);
    this.img = new Image();
    this.img.className = 'center_img';
    PlanterImage.createImage()
    .then(function(URI) {
      this.img.src = URI;
    }.bind(this));
  }
  reload() {
    var div = super.reload();
    this.element.className = 'mui-col-xs-6';
    div.innerHTML = '';
    var titleHolder = document.createElement('h2');
    titleHolder.className = 'mui--align-middle';
    div.appendChild(titleHolder);
    titleHolder.appendChild(this.img);
    var title = document.createElement('center');
    titleHolder.appendChild(title);
    title.innerText = this.resource.name;
    return div;
  }
}

class PlanterList extends List {
  constructor(app, element, addButton, resource) {
    super(app, element, resource, PlanterListel, 'No Planters');
    this.addButton = addButton;
    this.addButton.onclick = this.addPlanter.bind(this);
  }
  reload() {
    return super.reload()
    .then(function() {
      this.element.style.marginTop = '20px';
      var children = this.element.childNodes;
      for (var i = 0; i < children.length; i += 2) {
        var row = document.createElement('div');
        row.className = 'mui-row';
        this.element.appendChild(row);
        for (var j = i; j < i && typeof children[j] !== 'undefined'; j++) {
          row.appendChild(children[j]);
        }
      }
    }.bind(this));
  }
  addPlanter() {
    var add = new PlanterAddModal(this.app, document.createElement('div'),
        this.resource);
    add.reload();
    this.app.popup(add.element, true);
  }
}

export {
  Planter,
  PlanterDict,
  PlanterAdvancedOptions,
  PlanterDiagnostics,
  PlanterCalendar,
  PlanterModal,
  PlanterSetup,
  PlanterAddModal,
  PlanterListel,
  PlanterList
};
