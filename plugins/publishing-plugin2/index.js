
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
    this.submit = this.submit.bind(this);
  }

  init() {
    const { getLocalStore } = this.core;
    getLocalStore().then((formData = {}) => {
      this.insertFormElements(formData);
    })
    console.log("Sample Plugin 2");
  }

  insertFormElements(formData) {
    this.inputFields.map(inputData => {
      formData && (inputData.defaultValue = formData[inputData.name]);
      this.draw.addFormElement(inputData);
    });
  }

  submit(data) {
    console.log(data);
    this.core.setLocalStore(data);
  }

}

module.exports = darwin;
