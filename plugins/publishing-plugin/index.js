
class darwin {
  constructor({ performTask, draw, id }) {
    this.id = id;
    this.draw = draw;

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

    this.insertFormElements();
    console.log("Sample Plugin 1");

    this.clickEvent = function () {
      console.log('Darwin 2.0 activated');
    };
  }

  insertFormElements() {
    this.inputFields.map(inputData => {
      this.draw.addFormElement({ id: this.id, data: inputData });
    });
  }

}

module.exports = darwin;
