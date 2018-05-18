class Planter extends Resource {
  constructor(sync, name, meta, value) {
    super(sync, name, 'planter', meta, value);
    if (typeof this.value !== 'object') {
      /* If a planter does not receive a configuration file, it will use default
       * settings. (V = 0, W = 0, X = 8, Y = 1, Z = 40)
       */
      this.value = {
        vacationMode: false,
        vacationModeLength: 2,
        useFeritizer: true,
        moistureLowerBound: 20,
        daysBetweenWaters: 7,
        numberWatersInTank: 16,
        currentWatersInTank: 16,
        numberPumpRunsPerWater: 1,
        numberFertilizersInTank: 8,
        currentFertilizersInTank: 8,
        demoMode: false,
        demoFrequency: 30
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
      demoFrequency: 'Demo Mode Frequency: Water every {0} seconds'
    };
  }
}

class PlanterDict extends Dict {
  constructor(sync, name, meta, value) {
    super(sync, name, 'planters', Planter, meta, value);
  }
}

class PlanterModal extends View {
  constructor(app, element, resource) {
    super(app, element, resource);
    this.advancedOptions = [
      new Input(this.resource, 'vacationModeLength',
          'Vacation Mode length in weeks', 'mui-textfield'),
      new Input(this.resource, 'demoMode', 'Demo Mode',
          'mui-checkbox', 'checkbox'),
      new Input(this.resource, 'demoFrequency', 'Demo Frequency in seconds',
          'mui-textfield', 'number'),
    ];
  }
  reload() {
    var div = super.reload();
    div.user = this;
    div.dismissed = function() {};
    var center = document.createElement('center');
    div.appendChild(center);
    center.className = 'mui--align-middle';
    var title = document.createElement('h1');
    title.innerText = 'Configure Planter';
    center.appendChild(title);
    center.appendChild(document.createElement('br'));
    /* Planter name */
    var name = new Input(this.resource, 'name', 'Name', 'mui-textfield');
    if (typeof this.resource.name === 'string' && this.resource.name.length > 0) {
      name.input.setAttribute('disabled', true);
    } else {
      name.input.setAttribute('autofocus', true);
    }
    center.appendChild(name.element);
    center.appendChild(document.createElement('br'));
    center.appendChild(new Input(this.resource, 'vacationMode', 'Vacation Mode',
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
    var climate = document.createElement('input');
    climate.setAttribute('disabled', true);
    center.appendChild(climate);
    center.appendChild(document.createElement('br'));
    center.appendChild(document.createElement('br'));
    center.appendChild(document.createElement('br'));
    const setClimate = function() {
      if (this.resource.value.moistureLowerBound <= 20) {
        climate.value = 'Arid';
      } else if (this.resource.value.moistureLowerBound >= 60) {
        climate.value = 'Tropical';
      } else {
        climate.value = 'Semi-Arid';
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
    // TODO Add advanced button which enables more settings
    var remove  = new Button('Delete', 'mui-btn mui-btn--danger');
    remove.element.onclick = function(event) {
      this.app.planters.remove(this.resource.name);
      this.app.popdown();
    }.bind(this);
    center.appendChild(remove.element);
    center.appendChild(new Checkbox('Advanced', 'mui-checkbox',
        this.showAdvanced.bind(this), this.hideAdvanced.bind(this)).element);
    div.remove = remove;
    this.center = center;
  }
  showAdvanced() {
    for (var element in this.advancedOptions) {
      this.center.appendChild(this.advancedOptions[element].element);
    }
  }
  hideAdvanced() {
    for (var element in this.advancedOptions) {
      this.center.removeChild(this.advancedOptions[element].element);
    }
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
  }
}

class PlanterListel extends Listel {
  constructor(app, element, resource) {
    super(app, element, resource, PlanterModal);
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
