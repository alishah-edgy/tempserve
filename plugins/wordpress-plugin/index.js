

class darwin {

  stage = 'start';

  constructor({ core, draw, id }) {
    this.id = id;
    this.draw = draw;
    this.core = core;
    this.stage = 'start';
    this.init = this.init.bind(this);
    this.sendKeyHandler = this.sendKeyHandler.bind(this);
    this.submit = this.submit.bind(this);
  }

  init() {

    const { banner, formElement, label, horizontalDivider, expandableList } = this.draw;
    const { getLocalStore } = this.core;

    console.log("Wordpress Plugin");
    getLocalStore().then(formData => {

      banner({
        src: "https://www.colleaguesoftware.com/wp-content/uploads/2019/10/wordpress-logo.png",
      });

      formElement({
        name: "wpkey",
        placeholder: "wordpress key",
        defaultValue: formData ? formData["wpkey"] : undefined,
        styles: {
          width: "91%"
        },
        type: "input",
      });

      formElement({
        name: "Add",
        type: "btn",
      });

      horizontalDivider();

      // addEmptyState({
      //   text: "No Configs Available",
      // });
      label({
        text: "Save Configs",
        styles: {
          textAlign: 'center',
          fontWeight: 'bold',
        },
      });

      expandableList({
        title: "https://facebook.com",
        fields: [
          { label: "User:", value: "Jane Doe" },
          { label: "Email:", value: "abc@xyz.com" },
        ],
        btn: "Publish Article",
      });
      expandableList({
        title: "https://Google.com",
        fields: [
          { label: "User:", value: "Jane Doe" },
          { label: "Email:", value: "abc@xyz.com" },
        ],
        btn: "Publish Article",
      });
      expandableList({
        title: "https://yahoo.com/plug",
        fields: [
          { label: "User:", value: "Jane Doe" },
          { label: "Email:", value: "abc@xyz.com" },
        ],
        btn: "Publish Article",
      });

    });

    this.clickEvent = function () {
      console.log('Darwin 2.0 activated');
    };
  }

  sendKeyHandler(data) {
    console.log(data);

    this.draw.clear();
    this.draw.setLoading({ status: true });

    setTimeout(() => {
      this.draw.setLoading({ status: false });
      this.draw.clear();
      this.init();
    }, 3000);
  }

  submit(data) {
    this.core.setLocalStore(data);
    this.onKeySubmit(data.wpkey);
  }

  // Example POST method implementation:
  async postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }

  secretKey = '132132312321312'

  onKeySubmit = (key = '5e4d5c4ed7a3b') => {
    key.trim() !== "" && this.postData(
      `https://staging.inkforall.com/wp-json/ink-route/ink-check?key=${key}`,
      {}
    ).then((data) => {
      console.log(data);
    });
  }
}

module.exports = darwin;
