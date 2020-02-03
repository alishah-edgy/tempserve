
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

    this.insertFormElements();
    console.log("Sample Plugin 2");

    this.clickEvent = function () {
      console.log('Darwin 2.0 activated');
    };
  }

  insertFormElements() {
    this.inputFields.map(inputData => {
      this.draw.addFormElement({ id: this.id, inputData });
    });
  }

}

module.exports = darwin;
