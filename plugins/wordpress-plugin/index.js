

let workID = 0;

class darwin {
  stage = 'start';
  constructor(_INK, ipcRenderer) {
    this._INK = _INK;
    this.stage = 'start';
    this.inputFields = [
      {
        name: "wordpress key",
        type: "input"
      },
      {
        name: "jwt token",
        type: "input"
      },
      {
        name: "publish",
        type: "btn"
      },
    ];
    this.insertInputFields();
    // open keyInput Form
    // addInputField('Secret Key','secretKey', styles);
    // addButton('Verify Key', this.onKeySubmit, styles);
    this.ipcRenderer = ipcRenderer;
    console.log("Wordpress Plugin", _INK, ipcRenderer);
    // _INK["menu-item"]({ icon: "abc", name: "Test Plugin", classId: 'darwin-menu-icon' });
    this.clickEvent = function () {
      console.log('Darwin 2.0 activated');
    }
  }

  insertInputFields() {
    this.inputFields.map(inputData => {
      this.useCommand(_INK.commands.addInputField, { pluginId: _INK.id, inputData }).then(res => {
        const { error } = res;
        if (error) {
          return console.log(error);
        }
      }, err => {
        console.log(err);
      })
    });
  }

  useCommand(event, payload) { // payload must be an object
    return new Promise((resolve) => {
      payload._workID = workID++;
      this.ipcRenderer.send('plugin-perform', event, payload); // goes to plugin-window.js
      this.ipcRenderer.once(`${event}-${payload._workID}-reply`, (evt, reply) => {
        if (payload._workID <= workID) {
          resolve(reply);
        }
      });
    });
  }

  secretKey = '132132312321312'

  onKeySubmit = (key) => {
    // validate key and fetch token
    this.token = '4234sdsad324324324324234sf2rewd2d2'
    // clear all fields
    // addInputField('Website Domain','websiteDomain', styles);
    // addButton('Fetch Domain Data',this.onDomainSubmission, styles);

  }

  onDomainSubmission = (domain, token) => {
    // getWebsiteData

    // addDropdown('Select Publication', 'publication', allPublicationsArray, styles)
    // addInputField('Post Title', 'title', styles);
    // addDropdown('Comment Status', 'comment_status', ['open', 'closed'], styles)
    // addDropdown('Ping Status', 'ping_status', ['open', 'closed'], styles)
    // addInputField('Add tags', 'tags', styles)
    // addButton('Publish', this.onPublish, styles);

  }

  onPublish = () => {
    // decode current article and format the html
    // call api to publish current article to wordpress.
  }

}

module.exports = darwin;
