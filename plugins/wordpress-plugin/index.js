class Wordpress_ORG {
  constructor({ core, draw, id }) {
    this.id = id;
    this.draw = draw;
    this.core = core;
    this.init = this.init.bind(this);
  }

  init() {
    console.log("Wordpress.Org Plugin");
    this.blogContainerId = "blogsListing";
    this.bannerUrl =
      "https://www.colleaguesoftware.com/wp-content/uploads/2019/10/wordpress-logo.png";
    this.apiUrl = "https://staging.inkforall.com/wp-json";
    this.displayMainScreen();
  }

  setLoader = (status) => {
    const { setLoading } = this.draw;
    setLoading({ status });
    this.loading = status;
  };

  displayMainScreen = () => {
    const {
      banner,
      formElement,
      horizontalDivider,
      customContainer,
      button,
    } = this.draw;

    banner({
      src: this.bannerUrl,
    });

    formElement({
      name: "privateKey",
      placeholder: "Enter wordpress key",
      type: "input",
    });

    button({
      text: "Add",
      clickEvent: "addKeyHandler",
    });

    customContainer({
      containerId: this.blogContainerId,
    });

    this.listBlogs();
  };

  selectPostBlog = () => {
    const {
      label,
      labeledValue,
      formElement,
      clear,
      button,
      expandContainer,
      banner,
    } = this.draw;
    const { setFormData, getArticle, notify } = this.core;
    const selectedBlog = this.linkedBlogs.filter(
      (blog) => blog["Blog url"] === this.blogId
    )[0];
    getArticle({ type: "html" }).then((html) => {
      let parser = new DOMParser();
      let htmlDoc = parser.parseFromString(html, "text/xml");
      let title = htmlDoc.title;
      let imgElements = htmlDoc.getElementsByTagName("img");
      if (!title) {
        notify({
          title: "Wordpress.Org",
          message: "Article title is required!",
          status: "warning",
        });
        return;
      }
      clear();
      banner({
        src: this.bannerUrl,
      });
      label({
        text: "Article Post Creation",
        styles: {
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "10px",
        },
      });
      labeledValue({
        label: "Post Title:",
        value: title || "Unknown",
      });
      labeledValue({
        label: "Media Count:",
        value: imgElements.length,
      });
      labeledValue({
        label: "Blog Title:",
        value: selectedBlog ? selectedBlog["Blog Title"] : "Unknown",
        styles: {
          marginTop: "10px",
        },
      });
      labeledValue({
        label: "Site URL:",
        value: this.blogId || "Unknown",
      });
      expandContainer({
        title: "Configurations",
        contentContainerId: "configsContainer",
        contentStyles: {
          padding: "2px 5px",
        },
        titleStyles: {
          padding: "3px 5px",
        },
      });
      label({
        text: "keywords",
        containerId: "configsContainer",
        styles: {
          fontSize: "10px",
          height: "17px",
        },
      });
      formElement({
        //keyword input element
        name: "keywords",
        containerId: "configsContainer",
        type: "input",
        placeholder: "Enter comma separated keywords",
        styles: {
          margin: "5px 0px",
        },
      });
      label({
        text: "Status",
        containerId: "configsContainer",
        styles: {
          fontSize: "10px",
          height: "17px",
        },
      });
      formElement({
        //status dropdown element
        name: "status",
        containerId: "configsContainer",
        type: "dropDown",
        options: [
          { name: "Publish", value: "Publish" },
          { name: "Future", value: "Future" },
          { name: "Draft", value: "Draft" },
          { name: "Pending", value: "Pending" },
          { name: "Private", value: "Private" },
          { name: "Trash", value: "Trash" },
          { name: "Auto-Draft", value: "Auto-Draft" },
        ],
      });
      this.setLoader(true);
      this.request(
        `${this.apiUrl}/token-route/token-check?key=${selectedBlog.key}`,
        {},
        "POST"
      ).then((data) => {
        this.setLoader(false);
        if (data.code !== "Null") {
          this.idToken = data.Token;
          label({
            text: "Categories",
            containerId: "configsContainer",
            styles: {
              fontSize: "10px",
              height: "17px",
            },
          });
          formElement({
            //status dropdown element
            name: "categoryId",
            containerId: "configsContainer",
            type: "dropDown",
            options: data.Categories.map((c) => ({
              name: c.Name,
              value: c.ID,
            })),
          });
          setFormData({
            categoryId: "1",
          });
        } else {
          console.log("API call failed");
        }
      });
      button({
        text: "Cancel",
        styles: {
          backgroundColor: "#666",
          borderColor: "#666",
          color: "#fff",
          display: "inline",
          marginRight: "2%",
          width: "48%",
        },
        clickEvent: "cancelPostHandler",
      });
      button({
        text: "Create",
        styles: {
          marginLeft: "2%",
          display: "inline",
          width: "48%",
        },
        clickEvent: "createPostHandler",
      });
    });
  };

  cancelPostHandler = () => {
    if (this.postCreationStage !== "post") {
      const { clear } = this.draw;
      this.postCreationStage = null;
      clear();
      this.displayMainScreen();
      clear({
        containerId: "loadingState",
      });
      this.setLoader(false);
    }
  };

  createPostHandler = () => {
    if (this.postCreationStage || this.loading) return;
    const { clear } = this.draw;
    const selectedBlog = this.linkedBlogs.filter(
      (blog) => blog["Blog url"] === this.blogId
    )[0];
    this.setLoader(true);
    this.postCreationStage = "media";
    let parser = new DOMParser();
    this.core.getArticle({ type: "html" }).then((html) => {
      let htmlDoc = parser.parseFromString(html, "text/xml");
      let imgSrc = [];
      let token = `Bearer ${this.accessToken}`;
      let files = [];
      let title = htmlDoc.title;
      let imgElements = htmlDoc.getElementsByTagName("img");
      let promise = null;
      if (title) {
        //removing first child that is "H1" node for title
        htmlDoc.body.firstElementChild.remove();
        if (imgElements.length > 0) {
          for (let index = 0; index < imgElements.length; index++) {
            const imgEle = imgElements[index];
            let imgWidth = imgEle.style.width;
            let imgSource = imgEle.src;
            imgEle.id = `wp-test-${index}`;
            imgEle.width = imgWidth
              ? imgWidth.slice(0, imgWidth.length - 2)
              : 0; //fixing image width issue
            imgSrc.push(imgSource); //collecting all the image sources
            files.push(this.urlToFileBlob(imgSource, `wp-upload-${index}`)); //collecting all the file blobs
          }
          //creating formdata for multipart api request
          const formData = new FormData();
          formData.append("key", selectedBlog.key);
          formData.append("jwt", this.idToken);
          formData.append("submit", "upload");
          files.forEach((file, i) => {
            formData.append(`file[]`, file, `wp-test-${i}`);
          });

          //uploading media and retrieving their urls
          // this.setLoadingText("Uploading Media...");
          promise = this.request(
            `${this.apiUrl}/ink-media/upload`,
            formData,
            "POST",
            "multipart/form-data"
          ).then(
            (data) => {
              //parsing html and placing new image sources
              this.recentUploadedMedia = data;
              for (let index = 0; index < imgElements.length; index++) {
                const imgEle = imgElements[index];
                data.find((img) => {
                  if (imgEle.id === img.name) {
                    imgEle.src = img.url;
                    return true;
                  }
                  return false;
                });
              }
              return;
            },
            (err) => {
              this.postCreationStage = null;
              this.setLoader(false);
              this.core.notify({
                title: "Wordpress.Org",
                message: "Media Uploading Failed: " + err,
                status: "error",
              });
            }
          );
        }
        //create post api request
        Promise.all([promise]).then(() => {
          this.publishPostAPIhandler(
            title,
            htmlDoc.body.innerHTML,
            selectedBlog.key
          );
        });
      } else {
        this.setLoader(false);
        this.postCreationStage = null;
        this.core.notify({
          title: "Wordpress.Org",
          message: "Article title is required!",
          status: "warning",
        });
      }
    });
  };

  publishPostAPIhandler = (title, body, key) => {
    const { clear } = this.draw;
    if (this.postCreationStage === "media") {
      // this.setLoadingText("Creating Post...");
      this.postCreationStage = "post";
      this.core.getFormData().then((data) => {
        const { status, keywords: keyword, categoryId: categoryid } = data;
        this.request(
          `${this.apiUrl}/token-post-route/token-post-publish`,
          {
            title,
            body,
            key,
            keyword,
            status,
            meta: "",
            categoryid,
            jwt: this.idToken,
          },
          "POST"
        )
          .then((res) => {
            console.log(res);
            if (res.Status === "Success") {
              clear();
              this.displayMainScreen();
              this.core.notify({
                title: "Wordpress.Org",
                message: "Post Created Successfully!",
                status: "success",
                url: res["Published URL"],
                delay: "sticky",
              });
            } else {
              console.log(this.recentUploadedMedia);
              this.core.notify({
                title: "Wordpress.Org",
                message: "Post Creation Failed: " + res.message,
                status: "error",
              });
              //removing media from WP servers in-case of failure
              // this.recentUploadedMedia.forEcach(({ ID }) => {
              //   this.request(
              //     `${this.apiUrl}/delete-media`,
              //     {
              //       siteId: this.siteId,
              //       token,
              //       mediaId: ID,
              //     },
              //     'POST'
              //   )
              // })
            }
            return;
          })
          .finally(() => {
            clear({
              containerId: "loadingState",
            });
            this.setLoader(false);
            this.idToken = null;
            this.blogId = null;
            this.postCreationStage = null;
          });
      });
    }
  };

  removeLinkedBlog = (blogUrl) => {
    const { getLocalStore, setLocalStore } = this.core;
    getLocalStore().then((store) => {
      if (store && store.linkedBlogs) {
        let { linkedBlogs } = store;
        linkedBlogs = linkedBlogs.filter(
          (blog) => blog["Blog url"] !== blogUrl
        );
        store.linkedBlogs = [...linkedBlogs];
        setLocalStore(store).then(this.listBlogs);
      }
    });
  };

  insertBlog = (data) => {
    const { getLocalStore, setLocalStore } = this.core;
    getLocalStore().then((store) => {
      if (!store) store = {};
      let { linkedBlogs } = store;
      if (linkedBlogs) {
        linkedBlogs = linkedBlogs.filter((blog) => {
          return blog["Blog url"] !== data["Blog url"];
        });
        linkedBlogs.unshift(data);
      } else linkedBlogs = [data];
      store.linkedBlogs = [...linkedBlogs];
      setLocalStore(store).then(this.listBlogs);
    });
  };

  listBlogs = () => {
    const containerId = this.blogContainerId;
    const {
      clear,
      label,
      horizontalDivider,
      labeledValue,
      expandContainer,
      button,
    } = this.draw;
    const { getLocalStore } = this.core;
    clear({
      containerId,
    });
    getLocalStore().then((data) => {
      if (!data) data = {};
      const { linkedBlogs } = data;
      if (linkedBlogs && linkedBlogs.length > 0) {
        console.log("entered");
        horizontalDivider({
          containerId,
        });
        label({
          text: "Linked Blogs",
          containerId,
          styles: {
            textAlign: "center",
            fontWeight: "bold",
          },
        });
        const btnStyles = {
          width: "48%",
          height: "25px",
          lineHeight: "21px",
          display: "inline",
        };
        this.linkedBlogs = linkedBlogs;
        linkedBlogs.map((data) => {
          const contentId = data["Blog url"];
          expandContainer({
            title: data["Blog url"],
            contentContainerId: contentId,
            containerId,
            group: "blogs",
          });
          const tempArr = [
            { label: "Title:", key: "Blog Title" },
            { label: "Version:", key: "Blog Version" },
            { label: "User:", key: "User Name" },
            { label: "Email:", key: "User email" },
          ];
          tempArr.forEach(({ label, key }) =>
            labeledValue({ label, value: data[key], containerId: contentId })
          );
          button({
            text: "Remove",
            clickEvent: `remove-${contentId}`,
            containerId: contentId,
            styles: {
              ...btnStyles,
              backgroundColor: "#666666",
              borderColor: "#666666",
              color: "#fff",
              marginRight: "2%",
            },
          });
          button({
            text: "Post",
            containerId: contentId,
            clickEvent: `post-${contentId}`,
            styles: {
              ...btnStyles,
              marginLeft: "2%",
            },
          });
          this[`remove-${contentId}`] = () => {
            console.log("remove funcion ran: " + contentId);
            this.removeLinkedBlog(contentId);
          };
          this[`post-${contentId}`] = () => {
            this.blogId = contentId;
            this.selectPostBlog();
          };
        });
      }
    });
  };

  addKeyHandler = (key = "5e4d5c4ed7a3b") => {
    const { getFormData, setFormData } = this.core;
    getFormData().then((data) => {
      let key = data.privateKey;
      if (key.trim() === "" || this.loading) return;
      this.setLoader(true);
      this.request(
        `${this.apiUrl}/ink-route/ink-check?key=${key}`,
        {},
        "POST"
      ).then((blog) => {
        this.setLoader(false);
        if (blog.code !== "Null") {
          setFormData({
            privateKey: "",
          });
          const data = { ...blog, key };
          this.insertBlog(data);
        } else {
          console.log("API call failed");
        }
      });
    });
  };

  async request(
    url = "",
    data = {},
    type = "GET",
    content = "application/json"
  ) {
    let body = null;
    if (type !== "GET")
      body = content == "multipart/form-data" ? data : JSON.stringify(data);
    let ops = {
      method: type,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": content,
      },
      body,
    };
    if (content == "multipart/form-data") delete ops.headers["Content-Type"];
    const response = await fetch(url, ops);
    return await response.json();
  }

  urlToFileBlob(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
}

module.exports = Wordpress_ORG;
