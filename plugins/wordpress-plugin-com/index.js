class darwin {

  constructor({ core, draw, id }) {
    this.id = id;
    this.draw = draw;
    this.core = core;
    this.init = this.init.bind(this);
    this.addAccountHandler = this.addAccountHandler.bind(this);
    this.oAuthDataHandler = this.oAuthDataHandler.bind(this);
    this.loadUserData = this.loadUserData.bind(this);
    this.request = this.request.bind(this);
    this.api = 'http://192.168.100.50:3001/api';
    this.redirectCode = 8086;
  }

  init() {
    console.log("Wordpress.Com Plugin");
    const { addBanner, addButton } = this.draw;
    addBanner({
      src: "./public/img/logo-wpcom.png",
    });

    addButton({
      label: "Add Account",
      clickEvent: "addAccountHandler"
    });

  }

  loadUserData() {
    const { addHorizontalDivider, addUserProfileDisplay, clear, addBanner } = this.draw;
    this.request(`https://public-api.wordpress.com/rest/v1/me/`, null, 'GET')
      .then(({ email, display_name, avatar_URL }) => {
        clear();
        addBanner({
          src: "./public/img/logo-wpcom.png",
        });
        addUserProfileDisplay({
          imageSrc: avatar_URL,
          userTitle: display_name,
          userEmail: email,
        });
        addHorizontalDivider();
        this.request(`https://public-api.wordpress.com/rest/v1.1/me/sites`, null, 'GET')
          .then((res) => {
            console.log(res);
            this.userSites = res.sites;
          }, err => {
            console.warn(err);
          });
      }, err => {
        console.warn(err);
      });
  }

  oAuthDataHandler(code) {
    this.request(`http://192.168.100.50:3001/api/wordpress/token?code=${code}`, null, 'GET').then(res => {
      if (res.data) {
        this.accessToken = res.data.access_token;
        this.loadUserData();
      }
    }, err => {
      console.log(err);
    });
  }

  addAccountHandler() {
    this.core.openBrowserUrl({
      url: `${this.api}/wordpress/auth?state=${this.id}&redirectUri=http://127.0.0.1:${this.redirectCode}`,
    });
  }

  async request(url = '', data = {}, type = "GET") {
    let body = null;
    if (type !== 'GET') body = JSON.stringify(data);
    const response = await fetch(url, {
      method: type,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body,
    });
    return await response.json();
  }
}

module.exports = darwin;
