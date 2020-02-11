

class darwin {
  stage = 'start';
  constructor({ core, draw, id }) {
    this.id = id;
    this.draw = draw;
    this.core = core;

    this.stage = 'start';

    this.draw.addBanner({
      src: "https://www.colleaguesoftware.com/wp-content/uploads/2019/10/wordpress-logo.png",
    });

    this.inputFields = [
      {
        name: "wordpress key",
        type: "input"
      },
      {
        name: "Add",
        type: "btn",
      },
    ];

    this.insertFormElements();
    console.log("Wordpress Plugin");

    this.clickEvent = function () {
      console.log('Darwin 2.0 activated');
    };

    // this.draw.addHorizontalDivider();

    // this.draw.addLabel({
    //   text: "Current Configs",
    // });
  }

  insertFormElements() {
    this.inputFields.map(inputData => {
      this.draw.addFormElement({ inputData });
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
