
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
        "name": "savefuture",
        "type": "checkbox"
      },
      {
        "name": "typeofuser",
        "type": "dropDown",
        "value": [
          "new",
          "old",
          "semi-new",
          "semi-old",
          "genormous"
        ]
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
    console.log("Sample Plugin 2");
  }

  insertFormElements() {
    this.inputFields.map(inputData => {
      this.draw.addFormElement(inputData);
    });
  }

}

module.exports = darwin;
