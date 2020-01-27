import { editor, exposedAPI } from 'src/EditorAPI';

class darwin {
  stage = 'start';
  constructor(_INK, ipcRenderer) {
    this._INK = _INK;
    this.stage = 'start';
    console.log(editor, exposedAPI);
    editor("DownloadPlugins", { data: "some dummy data" }).then(res => {
      const { pluginData, error } = res;
      if (error) {
        return console.log(error);
      }
      if (!insertedPlugins.includes(pluginData.id)) {
        const plugin = require(`${tempPath}/${downloadLink.name}/${pluginData.main}`);
        var thisPlugin = new plugin(_INK);
        pluginData.clickEvent = thisPlugin.clickEvent;
        addPluginCB(pluginData);
        insertedPlugins.push(pluginData.id);
      }
    });
    // open keyInput Form
    // addInputField('Secret Key','secretKey', styles);
    // addButton('Verify Key', this.onKeySubmit, styles);

    this.ipcRenderer = ipcRenderer;
    console.log("Darwin 2.0", _INK, ipcRenderer);
    _INK["menu-item"]({ icon: "abc", name: "Test Plugin", classId: 'darwin-menu-icon' });
    this.clickEvent = function () {
      console.log('Darwin 2.0 activated');
    }
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
