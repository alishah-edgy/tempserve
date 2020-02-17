

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
    const { addBanner, addFormElement, addEmptyState, addHorizontalDivider } = this.draw;
    const { notify, getClipboardText, setClipboardText, getLocalStore, setLocalStore } = this.core;
    console.log("Wordpress Plugin");
    getLocalStore().then((formData = {}) => {
      addBanner({
        src: "https://www.colleaguesoftware.com/wp-content/uploads/2019/10/wordpress-logo.png",
      });

      addFormElement({
        name: "wordpress key",
        defaultValue: formData ? formData["wordpress key"] : undefined,
        type: "input",
      });

      addFormElement({
        name: "Add",
        type: "btn",
      });

      addHorizontalDivider();

      addEmptyState({
        text: "No Configs Available",
      });
    });

    this.clickEvent = function () {
      console.log('Darwin 2.0 activated');
    };
  }

  sendKeyHandler(data) {
    console.log(data);

    this.draw.clear();
    this.draw.addLoader();

    setTimeout(() => {
      this.draw.clear();
      this.init();
    }, 3000);

  }

  submit(data) {
    console.log(data);
    this.core.setLocalStore(data).then(res => {
      console.log(res);
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
