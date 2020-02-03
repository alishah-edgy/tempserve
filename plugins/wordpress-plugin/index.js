

class darwin {
  stage = 'start';
  constructor({ performTask, draw, id }) {
    this.id = id;
    this.draw = draw;

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

    this.insertFormElements();
    console.log("Wordpress Plugin");

    this.clickEvent = function () {
      console.log('Darwin 2.0 activated');
    };
  }

  insertFormElements() {
    this.inputFields.map(inputData => {
      this.draw.addFormElement({ id: this.id, data: inputData });
    });
  }

  secretKey = '132132312321312'

  onKeySubmit = (key) => {
    // validate key and fetch token
    this.token = '4234sdsad324324324324234;sf2rewd2d2';
    // clear all fields
    // addFormElement('Website Domain','websiteDomain', styles);
    // addButton('Fetch Domain Data',this.onDomainSubmission, styles);

  }

  onDomainSubmission = (domain, token) => {
    // getWebsiteData

    // addDropdown('Select Publication', 'publication', allPublicationsArray, styles)
    // addFormElement('Post Title', 'title', styles);
    // addDropdown('Comment Status', 'comment_status', ['open', 'closed'], styles)
    // addDropdown('Ping Status', 'ping_status', ['open', 'closed'], styles)
    // addFormElement('Add tags', 'tags', styles)
    // addButton('Publish', this.onPublish, styles);

  }

  onPublish = () => {
    // decode current article and format the html
    // call api to publish current article to wordpress.
  }

}

module.exports = darwin;
