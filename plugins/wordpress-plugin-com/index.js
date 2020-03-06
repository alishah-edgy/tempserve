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
    this.bannerUrl = "./public/img/logo-wpcom.png";
  }

  init() {
    console.log("Wordpress.Com Plugin");
    const { addBanner, addButton } = this.draw;
    addBanner({
      src: this.bannerUrl,
    });
    this.core.getLocalStore().then(data => {
      if (data && data.accessToken) {
        this.accessToken = data.accessToken;
        this.loadUserData();
      }
    });
    addButton({
      label: "Add Account",
      clickEvent: "addAccountHandler"
    });
  }

  loadUserData() {
    const {
      addLabel, setLoading, addHorizontalDivider, addExpandableList, addUserProfileDisplay, clear, addBanner, addButton, addEmptyState
    } = this.draw;
    setLoading({ status: true });
    this.request(`https://public-api.wordpress.com/rest/v1/me/`, null, 'GET')
      .then(({ email, display_name, avatar_URL }) => {
        clear();
        addBanner({
          src: this.bannerUrl,
        });
        addUserProfileDisplay({
          imageSrc: avatar_URL,
          userTitle: display_name,
          userEmail: email,
        });
        addButton({
          label: "Switch Account",
          clickEvent: "addAccountHandler",
        });
        addHorizontalDivider();
        this.request(`https://public-api.wordpress.com/rest/v1.1/me/sites`, null, 'GET')
          .then((res) => {
            this.userSites = res.sites;
            if (res.sites.length > 0) {
              addLabel({
                text: "Available Sites",
                styles: {
                  fontWeight: 'bold',
                  textAlign: 'center',
                }
              });
              res.sites.forEach(site => {
                addExpandableList({
                  title: site.URL,
                  btn: 'Publish Article'
                });
              });
              setLoading({ status: false });
            } else {
              addEmptyState({
                text: "No Sites Available",
              });
              setLoading({ status: false });
            }
          }, err => {
            console.warn(err);
          });
      }, err => {
        console.warn(err);
      });
  }

  oAuthDataHandler(code) {
    const { setLoading } = this.draw;
    clearTimeout(this.timer);
    if (!this.waitingForLogin) return;
    this.waitingForLogin = false;
    setLoading({ status: true });
    this.request(`http://192.168.100.50:3001/api/wordpress/token?code=${code}`, null, 'GET').then(res => {
      if (res.data) {
        this.accessToken = res.data.access_token;
        this.core.setLocalStore({
          accessToken: this.accessToken
        });
        this.loadUserData();
      }
    }, err => {
      setLoading({ status: false });
      console.log(err);
    });
  }

  addAccountHandler() {
    clearTimeout(this.timer);
    console.warn("Wordpress.Com waiting for sign in!!");
    this.core.openBrowserUrl({
      url: `${this.api}/wordpress/auth?state=${this.id}&redirectUri=http://127.0.0.1:${this.redirectCode}`,
    });
    this.waitingForLogin = true;
    this.timer = setTimeout(() => {
      this.waitingForLogin = false;
      console.warn("Wordpress.Com Sign In Timeout!!");
    }, 180000);
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

//save user token and log it in automatically next time

//listing of user's sites