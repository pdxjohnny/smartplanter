class Planter extends Resource {
  constructor(sync, name, meta, value) {
    super(sync, name, 'planter', meta, value);
    if (typeof this.value !== 'object') {
      /* If a planter does not receive a configuration file, it will use default
       * settings. (V = 0, W = 0, X = 8, Y = 1, Z = 40)
       */
      this.value = {
        vacationMode: false,
        waterStartHour: 0,
        waterPeriod: 8,
        useMiracleGro: true,
        moistureLowerBound: 40
      };
    }
    this.label = {
      vacationMode: 'Vacation Mode: {0}',
      waterStartHour: 'Hour To Start Watering: {0}',
      waterPeriod: 'Water Every {0} Hours',
      useMiracleGro: 'Use Miracle Gro: {0}',
      moistureLowerBound: 'Moisture Sensor Lower Bound: {0}'
    };
  }
}

class PlanterDict extends Dict {
  constructor(sync, name, meta, value) {
    super(sync, name, 'planters', Planter, meta, value);
  }
}

class PlanterModal extends View {
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
    /* V: Vacation mode on or not
     * Type: Boolean
     * Valid Value: 0 or 1
     * Comment: This has not been implemented
     */
    center.appendChild(new Input(this.resource, 'vacationMode', 'Vacation Mode',
          'mui-checkbox', 'checkbox').element);
    /* W: The hour of the first watering schedule of a day
     * Type: Integer
     * Valid Value: 0-23 (inclusive)
     * Comment: This should be the hour of the very first watering schedule of a
     * day. If the value sending in can have another watering schedule earlier,
     * the planter software will automatically update this value. (e.g. W = 15
     * and X = 6, the very first watering schedule should be 3am instead of 15.
     * Planter program will update W to 3)
     */
    var waterStartHour = new Input(this.resource, 'waterStartHour',
        'Hour To Start Watering', 'mui-textfield', 'number');
    waterStartHour.input.setAttribute('min', 0);
    waterStartHour.input.setAttribute('max', 23);
    center.appendChild(waterStartHour.element);
    /* X: Water the plant every X hours
     * Type: Integer
     * Valid Value: 1, 2, 3, 4, 6, 8, 12
     */
    var waterPeriod = new Input(this.resource, 'waterPeriod', 'Water Every _ Hours',
        'mui-textfield', 'number');
    // TODO Validation
    waterPeriod.input.setAttribute('min', 0);
    waterPeriod.input.setAttribute('max', 12);
    center.appendChild(waterPeriod.element);
    /* Y: Fertilize or not (weekly)
     * Type: Boolean
     * Valid Value: 0 or 1
     */
    center.appendChild(new Input(this.resource, 'useMiracleGro', 'Use Miracle Gro',
          'mui-checkbox', 'checkbox').element);
    /* Z: Water the plant when the moisture of soil drops below Z% and watering
     * is scheduled
     * Type: Integer
     * Valid Value: 1-100 (inclusive)
     */
    var moistureLowerBound = new Input(this.resource, 'moistureLowerBound',
        'Moisture Sensor Lower Bound', 'mui-textfield', 'number');
    moistureLowerBound.input.setAttribute('min', 0);
    moistureLowerBound.input.setAttribute('max', 100);
    center.appendChild(moistureLowerBound.element);
    var save = new Button('Save', 'mui-btn mui-btn--primary');
    save.onclick = function(event) {
      this.resource.update(this.resource.value);
      this.app.user.planters.add(this.resource.name, this.resource);
      this.app.popdown();
    }.bind(this);
    center.appendChild(save.element);
    div.save = save;
    var remove  = new Button('Delete', 'mui-btn mui-btn--danger');
    remove.onclick = function(event) {
      this.app.user.planters.remove(this.resource.name);
      this.app.popdown();
    }.bind(this);
    center.appendChild(remove.element);
    div.remove = remove;
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
    // TODO Add sync which makes POST to planter to send SSID, password, and
    // token over.
    var setup = new Resource([], 'setup', 'planter.setup', {}, {
      SSID: '',
      password: '',
      token: ''
    });
    center.appendChild(
        new Input(setup, 'SSID', 'SSID',
          'mui-textfield').element);
    center.appendChild(
        new Input(setup, 'password', 'Password',
          'mui-textfield').element);
    var next = new Button('Next', 'mui-btn mui-btn--primary');
    next.element.onclick = function(event) {
      setup.update(setup.value);
      console.log('POPDOWN');
      this.app.popdown();
      // TODO Configure planter with PlanterModal and add it to planters
      // (this.resource)
      // this.resource.add(this.resource.name, this.resource);
    }.bind(this);
    center.appendChild(next.element);
    var cancel  = new Button('Cancel', 'mui-btn mui-btn--danger');
    cancel.element.onclick = function(event) {
      console.log('POPDOWN');
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
