
class darwin {
  constructor({ core, draw, id }) {
    this.id = id;
    this.draw = draw;
    this.core = core;
    this.stage = 'start';
    this.inputFields = [
      {
        "name": "username",
        "type": "input"
      },
      {
        "name": "password",
        "type": "input"
      },
      {
        "name": "firstname",
        "type": "input"
      },
      {
        "name": "lastname",
        "type": "input"
      },
      {
        "name": "address",
        "type": "input"
      },
      {
        "name": "contactnumber",
        "type": "input"
      },
      {
        "name": "Submit",
        "type": "btn"
      }
    ];
    this.clickEvent = function () {
      console.log('Darwin 2.0 activated');
    };
    this.init = this.init.bind(this);
  }

  init() {
    this.insertFormElements();
    console.log("Sample Plugin 1");
  }

  insertFormElements() {
    this.inputFields.map(inputData => {
      this.draw.addFormElement(inputData);
    });
  }

}

module.exports = darwin;
