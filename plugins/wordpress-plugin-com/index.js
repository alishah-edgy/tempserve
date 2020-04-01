class Wordpress_Com {

  constructor({ core, draw, id }) {

    //variables
    this.id = id;
    this.draw = draw;
    this.core = core;
    // this.apiUrl = 'http://192.168.100.50:3001/api/wordpress';
    this.apiUrl = 'https://ink-api-test.seo.app/api/wordpress';
    // this.apiUrl = 'https://91d99ed6.ngrok.io/api/wordpress';
    this.redirectCode = 3047;
    this.bannerUrl = "./public/img/logo-wpcom.png";
    this.siteId = null;
    this.userSites = [];
    this.waitingForLogin = false;
    this.timer = null;
    this.accessToken = null;
    this.loggedUser = null;
    this.postCreationStage = null;
    this.loading = false;

    this.init = this.init.bind(this);
    this.request = this.request.bind(this);

    //authentication stuff
    this.addAccountHandler = this.addAccountHandler.bind(this);
    this.oAuthDataHandler = this.oAuthDataHandler.bind(this);

    //loading user data
    this.loadUserData = this.loadUserData.bind(this);

    //publishing article
    this.submit = this.submit.bind(this);
    this.selectPostSite = this.selectPostSite.bind(this);
    this.displayMainView = this.displayMainView.bind(this);
  }

  init() {
    console.log("Wordpress.Com Plugin");
    const { banner, button, clear } = this.draw;
    clear();
    banner({
      src: this.bannerUrl,
    });

    this.core.getLocalStore().then(data => {
      if (data && data.accounts) {
        if (data.accounts.length > 0) data.accounts.find(acc => {
          if (acc.ID === data.activeAccountId) {
            this.accessToken = acc.token;
            this.loadUserData();
            return true;
          }
          return false;
        })
      }
    });
    button({
      text: "Add Account",
      clickEvent: "addAccountHandler"
    });
  }

  listSites = sites => {
    const { label, expandableList, clear } = this.draw;
    clear({
      containerId: 'content',
    })
    label({
      text: "Available Sites",
      styles: {
        fontWeight: 'bold',
        textAlign: 'center',
      },
      containerId: 'content',
    });
    sites.forEach(({ URL, ID, name, post_count, launch_status }) => {
      expandableList({
        title: URL,
        btn: 'Create Post',
        fields: [
          { label: "Site Title:", value: name },
          { label: "Post Count:", value: post_count },
          { label: "Launch Status:", value: launch_status },
        ],
        containerId: 'content',
        clickEvent: ID,
        group: 'grouped-sites',
      });
      this[ID] = () => {
        this.siteId = ID;
        this.selectPostSite(this.siteId);
      };
    });
  }

  setLoader = status => {
    this.loading = status;
    this.draw.setLoading({ status });
  }

  userDataSave = ({ ID, email, display_name, avatar_URL }) => {
    const { getLocalStore, setLocalStore } = this.core;
    getLocalStore().then(data => {
      if (!data) data = { accounts: [] };
      if (!data.accounts) data.accounts = [];
      data.accounts = data.accounts.filter(acc => acc.ID !== ID);
      data.accounts.push({
        ID,
        email,
        display_name,
        avatar_URL,
        token: this.accessToken,
      })
      data.activeAccountId = ID;
      setLocalStore(data);
    })
  }

  setActiveAccountID = id => {
    const { getLocalStore, setLocalStore } = this.core;
    getLocalStore().then(data => {
      data.activeAccountId = id;
      setLocalStore(data);
    })
  }

  removeUserAcc = (id) => {
    const { setLocalStore, getLocalStore } = this.core;
    getLocalStore().then(data => {
      data.accounts = data.accounts.filter(acc => acc.ID !== id);
      if (data.accounts.length > 0) {
        data.activeAccountId = data.accounts[0].ID;
        this.accessToken = data.accounts[0].token;
        setLocalStore(data).then(this.switchAccountHandler());
      } else {
        data.activeAccountId = null;
        this.accessToken = null;
        setLocalStore(data).then(this.init());
      }
    })
  }

  loadUserData() {
    const {
      horizontalDivider, customContainer, userProfileDisplay, clear, banner, button, emptyState
    } = this.draw;
    this.setLoader(true)
    this.request(`https://public-api.wordpress.com/rest/v1/me/`, null, 'GET').then((user) => {
      this.loggedUser = user;
      const { email, display_name, avatar_URL } = user;
      this.userDataSave(user);
      clear();
      banner({
        src: this.bannerUrl,
      });
      userProfileDisplay({
        imageSrc: avatar_URL,
        userTitle: display_name,
        userEmail: email,
      });
      button({
        text: "Switch Account",
        clickEvent: "switchAccountHandler",
      });
      horizontalDivider();
      customContainer({
        containerId: 'content',
      })
      customContainer({
        containerId: 'loadingState',
        styles: {
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px',
          color: '#50bbf1',
        }
      })
      this.request(`https://public-api.wordpress.com/rest/v1.1/me/sites`, null, 'GET')
        .then((res) => {
          this.userSites = res.sites;
          if (res.sites.length > 0) {
            this.listSites(res.sites);
            this.setLoader(false)
          } else {
            emptyState({
              text: "No Sites Available",
              containerId: 'content',
            });
            this.setLoader(false)
          }
        }, err => {
          console.warn(err);
        });
    }, err => {
      console.warn(err);
    });
  }

  switchAccountHandler = () => {
    if (this.postCreationStage) return;
    const {
      label, button, userProfileDisplay, clear, banner
    } = this.draw;
    const { getLocalStore } = this.core;

    clear();
    banner({
      src: this.bannerUrl,
    });
    button({
      text: "Add Another Account",
      styles: { fontWeight: "normal" },
      clickEvent: "addAccountHandler"
    });
    label({
      text: "Linked Accounts",
      styles: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: '13px',
        margin: '15px 0',
        borderBottom: '1px solid',
      },
    });

    getLocalStore().then(data => {
      if (!data) return;
      data.accounts.forEach(({ ID, email, display_name, avatar_URL, token }) => {
        userProfileDisplay({
          imageSrc: avatar_URL,
          userTitle: display_name,
          userEmail: email,
          clickEvent: `selectAccount-${ID}`,
          closable: true,
        });
        this[`selectAccount-${ID}`] = ({ name }) => {
          if (this.loading) return;
          if (name == 'content') {
            this.accessToken = token;
            this.setActiveAccountID(ID);
            this.loadUserData(true);
          } else if (name == 'close') {
            this.removeUserAcc(ID)
          }
        }
      })
    })

  }

  setLoadingText = text => {
    const { clear, label } = this.draw;
    clear({
      containerId: 'loadingState',
    })
    label({
      text: text,
      containerId: 'loadingState',
    })
  }

  //for publishing article
  submit(data) {
    if (this.postCreationStage) return;
    const { clear } = this.draw;
    this.setLoader(true)
    this.postCreationStage = 'media';
    let parser = new DOMParser();
    this.core.getArticle({ type: "html" }).then(html => {
      let htmlDoc = parser.parseFromString(html, 'text/xml');
      let imgSrc = [];
      let token = `Bearer ${this.accessToken}`;
      let files = [];
      let title = htmlDoc.title;
      let imgElements = htmlDoc.getElementsByTagName('img');
      let promise = null;
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
          this.setLoadingText("Uploading Media...");
          promise = this.request(`${this.apiUrl}/upload-media`, formData, 'POST', "multipart/form-data")
            .then(({ data }) => {
              //parsing html and placing new image sources
              this.recentUploadedMedia = data.media;
              for (let index = 0; index < imgElements.length; index++) {
                const imgEle = imgElements[index];
                imgEle.src = data.media[index].URL;
              }
              return;
            }, err => {
              this.postCreationStage = null;
              this.setLoader(false)
              this.core.notify({
                message: "Wordpress.Com",
                title: "Media Uploading Failed: " + err,
                status: "error",
              });
            });
        }

        //create post api request
        Promise.all([promise]).then(() => {
          if (this.postCreationStage === 'media') {
            this.setLoadingText("Creating Post...");
            this.postCreationStage = 'post';
            this.request(
              `${this.apiUrl}/create-post`,
              {
                title,
                content: htmlDoc.body.innerHTML,
                password: '',
                siteId: this.siteId,
                token,
                status: data.status,
              },
              'POST'
            ).then((res) => {
              if (res.success) {
                this.displayMainView();
                this.core.notify({
                  title: "Wordpress.Com",
                  message: "Post Created Successfully!",
                  status: "success",
                  url: res.data.short_URL,
                  delay: 'sticky',
                });
              } else {
                this.core.notify({
                  title: "Post Creation Failed: " + err,
                  message: "Wordpress.Com",
                  status: "error",
                });
                //removing media from WP servers in-case of failure
                this.recentUploadedMedia.forEach(({ ID }) => {
                  this.request(
                    `${this.apiUrl}/delete-media`,
                    {
                      siteId: this.siteId,
                      token,
                      mediaId: ID,
                    },
                    'POST'
                  )
                })
              }
            }).finally(() => {
              clear({
                containerId: 'loadingState',
              });
              this.setLoader(false)
              this.postCreationStage = null;
            });
          }
        });
      } else {
        this.setLoader(false)
        this.postCreationStage = null;
        this.core.notify({
          message: "Wordpress.Com",
          title: "Article title is required!",
          status: "warning",
        });
      }
    });
  }

  selectPostSite() {
    const {
      label, labeledValue, formElement, horizontalDivider, userProfileDisplay, clear, banner, button, emptyState
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
          title: "Article title is required!",
          message: "Wordpress.Com",
          status: "warning",
        });
        return;
      }
      clear({
        containerId: 'content',
      });
      label({
        text: "Article Post Creation",
        containerId: 'content',
        styles: {
          fontWeight: 'bold',
          textAlign: 'center',
        }
      });
      labeledValue({
        containerId: 'content',
        label: 'Post Title:',
        value: title || "Unknown"
      });
      labeledValue({
        containerId: 'content',
        label: 'Media Count:',
        value: imgElements.length,
      });
      labeledValue({
        containerId: 'content',
        label: 'Site Title:',
        value: selectedSite ? selectedSite.name : 'Unknown',
        styles: {
          marginTop: '10px',
        }
      });
      labeledValue({
        containerId: 'content',
        label: 'Site URL:',
        value: selectedSite ? selectedSite.URL : 'Unknown',
      });
      label({
        text: "Post Status:",
        containerId: 'content',
        styles: {
          fontWeight: 'bold',
          fontSize: "13px",
        }
      });
      formElement({  //status dropdown element
        name: "status",
        containerId: 'content',
        type: "dropDown",
        options: [
          "publish",
          "private",
          "draft",
          "pending",
        ],
      });
      button({
        containerId: 'content',
        text: "Cancel",
        styles: {
          backgroundColor: '#666',
          borderColor: '#666',
          color: '#fff',
          display: 'inline',
          marginRight: '2%',
          width: '48%',
        },
        clickEvent: "cancelPostHandler",
      });
      formElement({  //creates a submit button
        name: "Create",
        containerId: 'content',
        type: "btn",
        styles: {
          marginLeft: '2%',
          display: 'inline',
          width: '48%',
        }
      });
    });
  }

  cancelPostHandler = () => {
    if (this.postCreationStage !== 'post') {
      const { clear } = this.draw;
      this.postCreationStage = null;
      this.displayMainView();
      clear({
        containerId: 'loadingState',
      });
      this.setLoader(false)
    }
  }

  displayMainView() {
    const {
      setLoading, clear, emptyState
    } = this.draw;
    this.siteId = null;
    clear({
      containerId: 'content',
    });
    if (this.userSites.length > 0) {
      this.listSites(this.userSites);
      this.setLoader(false)
    } else {
      emptyState({
        text: "No Sites Available",
        containerId: 'content',
      });
      this.setLoader(false)
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
    this.setLoader(true)
    this.request(`${this.apiUrl}/token?code=${code}&redirect_uri=http://127.0.0.1:${this.redirectCode}`, null, 'GET').then(res => {
      if (res.data) {
        this.accessToken = res.data.access_token;
        this.loadUserData();
      }
    }, err => {
      this.setLoader(false)
      console.log(err);
    });
  }

  addAccountHandler() {
    clearTimeout(this.timer);
    console.log("Wordpress.Com waiting for sign in!!");
    this.core.openUrl({
      url: `${this.apiUrl}/auth?state='${this.id}'&redirectUri=http://127.0.0.1:${this.redirectCode}`,
    });
    this.waitingForLogin = true;
    this.timer = setTimeout(() => {
      this.waitingForLogin = false;
      console.warn("Wordpress.Com Sign In Timeout!!");
    }, 300000);
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
    if (type !== 'GET') body = (content == "multipart/form-data") ? data : JSON.stringify(data);
    let ops = {
      method: type,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': content,
      },
      body
    }
    if (content == "multipart/form-data")
      delete ops.headers["Content-Type"]
    const response = await fetch(url, ops);
    return await response.json();
  }

}

module.exports = Wordpress_Com;