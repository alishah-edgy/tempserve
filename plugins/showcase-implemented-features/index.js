class DemoPlugin {

  constructor({ core, draw, id }) {  //Retrieve Main APIs (core and draw) from constructor
    this.id = id;
    this.draw = draw;
    this.core = core;
    this.init = this.init.bind(this);
    this.submit = this.submit.bind(this);
    this.switchTheme = this.switchTheme.bind(this);
  }

  init() {
    //This function will be called ones the plugin is integrated and ready!
    const
      {
        addBanner, addButton, addFormElement, addEmptyState, addHorizontalDivider, addLabel, addLoader
      } = this.draw,
      {
        getLocalStore,
      } = this.core;

    getLocalStore().then(data => {
      //creating the MyPlugin banner
      addBanner({
        src: "https://www.logolynx.com/images/logolynx/05/058631e9fb045407a6b9f04dc3891e94.jpeg",
      });

      addFormElement({
        type: "input",
        name: 'Demo Input',
        defaultValue: data ? data.inputData : undefined,
      });
      addFormElement({
        type: "btn",
        name: 'Copy to clipboard',
      });
      addLabel({
        text: "Data will be saved in local store too, with this plugin's unique Id",
      });
      addHorizontalDivider();

      //showing empty state
      addEmptyState({
        text: "No Data Available!",
      });

      addButton({
        label: "Switch Theme",
        clickEvent: 'switchTheme',
        styles: {
          fontWeight: 400,
          height: 25,
          lineHeight: "20px",
          cursor: 'pointer',
        }
      });

      addLoader();
    });
  }

  submit(data) {
    const { setClipboardText, setLocalStore } = this.core;
    setClipboardText({
      text: data['Demo Input'],
    });
    setLocalStore({
      inputData: data['Demo Input'],
    });
  }

  switchTheme() {
    const { getUserSettings, userSettings } = this.core;
    getUserSettings().then(settings => {
      userSettings({
        theme: settings.theme == 1 ? 2 : 1,
      });
    });
  }
}

module.exports = DemoPlugin;