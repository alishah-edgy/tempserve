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
    this.displayMainScreen();
  }

  setLoader = status => {
    const { setLoading } = this.draw;
    setLoading({ status });
    this.loading = status;
  }

  displayMainScreen = () => {
    const { banner, formElement, horizontalDivider, customContainer } = this.draw;
    const { getLocalStore } = this.core;

    banner({
      src: "https://www.colleaguesoftware.com/wp-content/uploads/2019/10/wordpress-logo.png",
    });

    formElement({
      name: "wpkey",
      placeholder: "wordpress key",
      type: "input",
    });

    formElement({
      name: "Add",
      type: "btn",
    });

    horizontalDivider();

    customContainer({
      containerId: this.blogContainerId
    })

    this.listBlogs()
  }

  listBlogs = () => {
    const containerId = this.blogContainerId;
    const { clear, label, emptyState, labeledValue, expandContainer, button } = this.draw;
    const { getLocalStore } = this.core;
    clear({
      containerId,
    });
    label({
      text: "Linked Blogs",
      containerId,
      styles: {
        textAlign: 'center',
        fontWeight: 'bold'
      }
    })
    getLocalStore().then((data) => {
      if (!data) data = {};
      const { linkedBlogs } = data;
      const btnStyles = {
        width: "48%",
        height: "25px",
        lineHeight: '21px',
        display: 'inline',
      }
      if (linkedBlogs && linkedBlogs.length > 0) {
        linkedBlogs.map(data => {
          const contentId = data["Blog url"];
          expandContainer({
            title: data["Blog url"],
            contentContainerId: contentId,
            containerId,
            group: 'blogs'
          })
          const tempArr = [
            { label: "Title:", key: "Blog Title" },
            { label: "Version:", key: "Blog Version" },
            { label: "User:", key: "User Name" },
            { label: "Email:", key: "User email" },
          ];
          tempArr.forEach(({ label, key }) => labeledValue({ label, value: data[key], containerId: contentId, }));
          button({
            text: "Remove",
            clickEvent: `remove-${contentId}`,
            containerId: contentId,
            styles: {
              ...btnStyles,
              backgroundColor: 'rgb(102, 102, 102)',
              borderColor: 'rgb(102, 102, 102)',
              color: 'rgb(255, 255, 255)',
              marginRight: '2%',
            }
          })
          button({
            text: "Post",
            containerId: contentId,
            clickEvent: `post-${contentId}`,
            styles: {
              ...btnStyles,
              marginLeft: '2%',
            }
          })
          this[`remove-${contentId}`] = () => {
            console.log("remove funcion ran: " + contentId)
          }
          this[`post-${contentId}`] = () => {
            console.log("post funcion ran: " + contentId)
          }
        })
      } else {
        emptyState({
          containerId,
          text: "No Blogs Available"
        })
      }
    })
  }

  insertBlog = data => {
    const { getLocalStore, setLocalStore } = this.core;
    getLocalStore().then(store => {
      if (!store) store = {};
      let { linkedBlogs } = store;
      if (linkedBlogs) {
        // linkedBlogs = linkedBlogs.filter(blog => {
        //   return blog["Blog url"] !== data["Blog url"]
        // })
        linkedBlogs.unshift(data)
      } else linkedBlogs = [data];
      store.linkedBlogs = [...linkedBlogs]
      setLocalStore(store).then(this.listBlogs);
    })
  }

  submit = (data) => {
    this.addKeyHandler(data.wpkey);
  }

  addKeyHandler = (key = '5e4d5c4ed7a3b') => {
    if (key.trim() === "" || this.loading) return;
    this.setLoader(true);
    const promises = [
      this.request(`https://staging.inkforall.com/wp-json/ink-route/ink-check?key=${key}`, {}, 'POST'),
      this.request(`https://staging.inkforall.com/wp-json/token-route/token-check?key=${key}`, {}, 'POST')
    ];
    Promise.all(promises).then(([blog, token]) => {
      this.setLoader(false);
      if (blog.code !== 'Null' || token.code !== 'Null') {
        const data = { ...blog, ...token };
        this.insertBlog(data);
      } else {
        console.log("API call failed")
      }
    })
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

module.exports = Wordpress_ORG;