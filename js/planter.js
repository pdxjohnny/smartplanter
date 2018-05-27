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
  constructor(app, element, resource) {
    super(app, element, resource);
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
    center.appendChild(new Input(this.resource, 'demoMode',
          'Demo Mode', 'mui-checkbox', 'checkbox').element);
    center.appendChild(document.createElement('br'));
    center.appendChild(new Input(this.resource, 'demoFrequency',
          'Demo Frequency in seconds', 'mui-textfield', 'number').element);
    return div;
  }
}

class PlanterDisplayValue extends Listel {
  constructor(app, element, resource) {
    super(app, element, resource);
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
    var cal = jsCalendar.new(calEl);
    const addDays = function(date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };
    const formatDate = function(date) {
      return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();
    };
    // TODO Find out when plant was last watered
    var today = new Date();
    var waterDates = [];
    for (var i in [1, 2, 3, 4, 5]) {
      i = Number(i);
      var day = formatDate(addDays(today, this.resource.value.daysBetweenWaters * i));
      waterDates.push(day);
    }
    cal.select(waterDates);
    return div;
  }
}

class PlanterModal extends View {
  constructor(app, element, resource) {
    super(app, element, resource);
    this.cal = new PlanterCalendar(app,
        document.createElement('div'), resoruce);
    this.advanced = new PlanterAdvancedOptions(app,
        document.createElement('div'), resoruce);
    this.displayValue = new PlanterDisplayValue(app,
        document.createElement('div'), resoruce);
  }
  reload() {
    var div = super.reload();
    this.cal.reload();
    this.advanced.reload();
    this.displayValue.reload();
    div.user = this;
    div.dismissed = function() {};
    var center = document.createElement('center');
    div.appendChild(center);
    center.className = 'mui--align-middle';
    var title = document.createElement('h1');
    title.innerText = this.resource.name;
    center.appendChild(title);
    center.appendChild(document.createElement('br'));
    center.appendChild(this.cal.element);
    center.appendChild(document.createElement('br'));
    center.appendChild(new Input(this.resource, 'vacationMode', 'Vacation Mode',
          'mui-checkbox', 'checkbox').element);
    center.appendChild(document.createElement('br'));
    center.appendChild(new Input(this.resource, 'vacationModeLength',
          'Vacation Mode length in weeks', 'mui-textfield').element);
    center.appendChild(document.createElement('br'));
    center.appendChild(new Input(this.resource, 'useFeritizer', 'Use Ferilizer',
          'mui-checkbox', 'checkbox').element);
    var arid = new Button('Arid', 'mui-btn mui-btn--fab mui-btn--danger');
    var semiarid = new Button('Semi', 'mui-btn mui-btn--fab mui-btn--accent');
    var tropical = new Button('Tropic', 'mui-btn mui-btn--fab mui-btn--primary');
    center.appendChild(document.createElement('br'));
    center.appendChild(arid.element);
    center.appendChild(semiarid.element);
    center.appendChild(tropical.element);
    center.appendChild(document.createElement('br'));
    center.appendChild(document.createElement('br'));
    center.appendChild(document.createElement('br'));
    const setClimate = function() {
      for (var chooice of [arid, semiarid, tropical]) {
        choice.className.replace(' choosen_plant_type', '');
      }
      if (this.resource.value.moistureLowerBound <= 20) {
        arid.className += ' choosen_plant_type';
      } else if (this.resource.value.moistureLowerBound >= 60) {
        semiarid.className += ' choosen_plant_type';
      } else {
        tropical.className += ' choosen_plant_type';
      }
    }.bind(this);
    arid.element.onclick = function(event) {
      this.resource.value.moistureLowerBound = 20;
      setClimate();
    }.bind(this);
    semiarid.element.onclick = function(event) {
      this.resource.value.moistureLowerBound = 40;
      setClimate();
    }.bind(this);
    tropical.element.onclick = function(event) {
      this.resource.value.moistureLowerBound = 60;
      setClimate();
    }.bind(this);
    setClimate();
    var save = new Button('Save', 'mui-btn mui-btn--primary');
    save.element.onclick = function(event) {
      this.resource.update(this.resource.value);
      this.app.popdown();
    }.bind(this);
    center.appendChild(save.element);
    div.save = save;
    var remove  = new Button('Delete', 'mui-btn mui-btn--danger');
    remove.element.onclick = function(event) {
      this.app.planters.remove(this.resource.name);
      this.app.popdown();
    }.bind(this);
    center.appendChild(remove.element);
    div.remove = remove;
    this.checkAdvanced = new Checkbox('Advanced', 'mui-checkbox',
        this.showAdvanced.bind(this), this.showSelf.bind(this));
    center.appendChild(this.checkAdvanced.element);
    this.checkDiagnostics = new Checkbox('Diagnostics', 'mui-checkbox',
        this.showDisplayValue.bind(this),
        this.showSelf.bind(this));
    center.appendChild(this.checkDiagnostics.element);
    this.center = center;
  }
  showSelf() {
    this.element.innerHTML = '';
    this.element.appendChild(this.div);
  }
  showAdvanced() {
    this.element.innerHTML = '';
    this.checkAdvanced.input.checked = false;
    this.element.appendChild(this.advanced);
  }
  showDisplayValue() {
    this.element.innerHTML = '';
    this.checkDiagnostics.input.checked = false;
    this.element.appendChild(this.displayValue);
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

class PlanterListel extends Listel {
  constructor(app, element, resource) {
    super(app, element, resource, PlanterModal);
  }
  reload() {
    var div = super.reload();
    div.innerHTML = '';
    var title = document.createElement('h2');
    div.appendChild(title);
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
  addPlanter() {
    var add = new PlanterAddModal(this.app, document.createElement('div'),
        this.resource);
    add.reload();
    this.app.popup(add.element, true);
  }
}
