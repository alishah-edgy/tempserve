class darwin {

  constructor({ core, draw, id }) {

    //variables
    this.id = id;
    this.draw = draw;
    this.core = core;
    this.apiUrl = 'http://192.168.100.50:3001/api/wordpress';
    // this.apiUrl = 'https://ink-api-test.seo.app/api/wordpress';
    this.redirectCode = 3047;
    this.bannerUrl = "./public/img/logo-wpcom.png";
    this.siteId = null;
    this.userSites = [];
    this.waitingForLogin = false;
    this.timer = null;
    this.accessToken = null;
    this.loggedUser = null;

    this.init = this.init.bind(this);
    this.request = this.request.bind(this);

    //authentication stuff
    this.addAccountHandler = this.addAccountHandler.bind(this);
    this.oAuthDataHandler = this.oAuthDataHandler.bind(this);

    //loading user data
    this.loadUserData = this.loadUserData.bind(this);

    //publishing article
    this.publishArticle = this.publishArticle.bind(this);
    this.selectPostSite = this.selectPostSite.bind(this);
    this.displayMainView = this.displayMainView.bind(this);
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
      .then((user) => {
        this.loggedUser = user;
        const { email, display_name, avatar_URL } = user;
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
              res.sites.forEach(({ URL, ID }) => {
                addExpandableList({
                  title: URL,
                  btn: 'Post Article',
                  clickEvent: ID,
                  group: 'grouped-sites',
                });
                this[ID] = () => {
                  this.siteId = ID;
                  this.selectPostSite(this.siteId);
                };
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

  publishArticle() {
    const { setLoading } = this.draw;
    setLoading({ status: true });
    let parser = new DOMParser();
    this.core.getArticle({ type: "html" }).then(html => {
      let htmlDoc = parser.parseFromString(html, 'text/xml');
      let imgSrc = [];
      let token = `Bearer ${this.accessToken}`;
      let files = [];
      let title = htmlDoc.title;
      let imgElements = htmlDoc.getElementsByTagName('img');
      let promises = [];
      if (title) {
        //removing first child that is "H1" node for title
        htmlDoc.body.firstElementChild.remove();
        if (imgElements.length > 0) {
          for (let index = 0; index < imgElements.length; index++) {
            const imgEle = imgElements[index];
            let imgWidth = imgEle.style.width;
            let imgSource = imgEle.src;
            imgEle.width = imgWidth ? imgWidth.slice(0, imgWidth.length - 2) : 0; //fixing image width issue
            imgSrc.push(imgSource); //collecting all the image sources
            files.push(this.urlToFileBlob(imgSource, `wp-upload-${index}`));  //collecting all the file blobs
          }

          //creating formdata for multipart api request
          const formData = new FormData();
          formData.append('siteId', this.siteId);
          formData.append('token', token);
          files.forEach((file, i) => {
            formData.append(`media`, file, `wp-test-${i}`);
          });

          //uploading media and retrieving their urls
          promises.push(fetch(`${this.apiUrl}/upload-media`, {
            method: 'POST',
            body: formData,
          }).then(res => res.json()).then(({ data }) => {

            //parsing html and placing new image sources
            for (let index = 0; index < imgElements.length; index++) {
              const imgEle = imgElements[index];
              imgEle.src = data.media[index].URL;
            }
            return;
          }, err => {
            setLoading({ status: false });
            this.core.notify({
              title: "Wordpress.Com",
              message: "Media Uploading Failed: " + err,
              status: "error",
            });
          }));
        }

        //create post api request
        Promise.all(promises).then(() => {
          fetch(`${this.apiUrl}/create-post`, {
            method: 'POST',
            body: JSON.stringify({
              title,
              content: htmlDoc.documentElement.innerHTML,
              password: '',
              siteId: this.siteId,
              token,
            }),
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }).then(res => res.json()).then((res) => {
            console.log(res);
            setLoading({ status: false });
            this.displayMainView();
            this.core.notify({
              title: "Wordpress.Com",
              message: "Post Created Successfully!",
              status: "success",
            });
          }, err => {
            setLoading({ status: false });
            this.core.notify({
              title: "Wordpress.Com",
              message: "Post Creation Failed: " + err,
              status: "error",
            });
          });
        });
      } else {
        setLoading({ status: false });
        this.core.notify({
          title: "Wordpress.Com",
          message: "Article title is required!",
          status: "warn",
        });
      }
    });
  }

  selectPostSite() {
    const {
      addLabel, labeledValue, addHorizontalDivider, addUserProfileDisplay, clear, addBanner, addButton, addEmptyState
    } = this.draw;
    const { email, display_name, avatar_URL } = this.loggedUser;
    const selectedSite = this.userSites.filter(site => site.ID === this.siteId)[0];
    this.core.getArticle({ type: "html" }).then(html => {
      let parser = new DOMParser();
      let htmlDoc = parser.parseFromString(html, 'text/xml');
      let title = htmlDoc.title;
      let imgElements = htmlDoc.getElementsByTagName('img');
      if (!title) {
        this.core.notify({
          title: "Wordpress.Com",
          message: "Article title is required!",
          status: "warn",
        });
        return;
      }
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
      addLabel({
        text: "Article Post Creation",
        styles: {
          fontWeight: 'bold',
          textAlign: 'center',
        }
      });
      labeledValue({
        label: 'Post Title:',
        value: title || "Unknown"
      });
      labeledValue({
        label: 'Media Count:',
        value: imgElements.length,
      });
      labeledValue({
        label: 'Site Title:',
        value: selectedSite ? selectedSite.name : 'Unknown',
        styles: {
          marginTop: '10px',
        }
      });
      labeledValue({
        label: 'Site URL:',
        value: selectedSite ? selectedSite.URL : 'Unknown',
      });
      addButton({
        label: "Cancel",
        styles: {
          backgroundColor: '#666',
          borderColor: '#666',
          color: '#fff',
          display: 'inline',
          marginRight: '2%',
          width: '48%',
        },
        clickEvent: "displayMainView",
      });
      addButton({
        label: "Publish",
        clickEvent: "publishArticle",
        styles: {
          marginLeft: '2%',
          display: 'inline',
          width: '48%',
        }
      });
    });
  }

  displayMainView() {
    const {
      addLabel, setLoading, addHorizontalDivider, addExpandableList, addUserProfileDisplay, clear, addBanner, addButton, addEmptyState
    } = this.draw;
    const { email, display_name, avatar_URL } = this.loggedUser;
    this.siteId = null;
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
    if (this.userSites.length > 0) {
      addLabel({
        text: "Available Sites",
        styles: {
          fontWeight: 'bold',
          textAlign: 'center',
        }
      });
      this.userSites.forEach(({ URL, ID }) => {
        addExpandableList({
          title: URL,
          btn: 'Post Article',
          clickEvent: ID,
        });
        this[ID] = () => {
          this.siteId = ID;
          this.selectPostSite(this.siteId);
        };
      });
      setLoading({ status: false });
    } else {
      addEmptyState({
        text: "No Sites Available",
      });
      setLoading({ status: false });
    }
  }

  extractImgSrc(articleData) {
    const imagesData = [];
    let isImageStarted = false;
    let isBase64Started = false;
    let imgData = '';
    for (let i = 0; i < articleData.length; i++) {
      if (i + 4 < articleData.length && articleData[i] === '<' && articleData[i + 1] === 'i' && articleData[i + 2] === 'm' && articleData[i + 3] === 'g') {
        isImageStarted = true;
      }
      if (isBase64Started) {
        imgData += articleData[i];
      }
      if (isImageStarted) {
        if (articleData[i] == '"' && !isBase64Started) {
          isBase64Started = true;
        } else if (articleData[i] === '"' && isBase64Started) {
          isBase64Started = false;
          isImageStarted = false;
          imgData = imgData.slice(0, imgData.length - 1);
          imagesData.push(imgData);
          imgData = '';
        }
      }
    }
    return imagesData;
  }

  oAuthDataHandler(code) {
    const { setLoading } = this.draw;
    clearTimeout(this.timer);
    if (!this.waitingForLogin) return;
    this.waitingForLogin = false;
    setLoading({ status: true });
    this.request(`${this.apiUrl}/token?code=${code}&redirect_uri=http://127.0.0.1:${this.redirectCode}`, null, 'GET').then(res => {
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
    console.log("Wordpress.Com waiting for sign in!!");
    this.core.openBrowserUrl({
      url: `${this.apiUrl}/auth?state='${this.id}'&redirectUri=http://127.0.0.1:${this.redirectCode}`,
    });
    this.waitingForLogin = true;
    this.timer = setTimeout(() => {
      this.waitingForLogin = false;
      console.warn("Wordpress.Com Sign In Timeout!!");
    }, 180000);
  }

  urlToFileBlob(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  async request(url = '', data = {}, type = "GET", content = 'application/json') {
    let body = null;
    if (type !== 'GET') body = JSON.stringify(data);
    const response = await fetch(url, {
      method: type,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': content,
      },
      body
    });
    return await response.json();
  }

}

module.exports = darwin;