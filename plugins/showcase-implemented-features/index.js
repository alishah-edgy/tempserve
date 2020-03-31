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
        banner, button, formElement, emptyState, horizontalDivider, label, setLoading
      } = this.draw,
      {
        getLocalStore,
      } = this.core;

    getLocalStore().then(data => {
      //creating the MyPlugin banner
      banner({
        src: "https://www.logolynx.com/images/logolynx/05/058631e9fb045407a6b9f04dc3891e94.jpeg",
      });

      formElement({
        type: "input",
        name: 'Demo Input',
        styles: { width: "92%" },
        defaultValue: data ? data.inputData : undefined,
      });
      formElement({
        type: "btn",
        name: 'Copy to clipboard',
      });
      label({
        text: "Data will be saved in local store too, with this plugin's unique Id",
      });
      horizontalDivider();

      //showing empty state
      emptyState({
        text: "No Data Available!",
      });

      button({
        label: "Switch Theme",
        clickEvent: 'switchTheme',
        styles: {
          fontWeight: 400,
          height: 25,
          lineHeight: "20px",
          cursor: 'pointer',
        }
      });

      setLoading({ status: true });
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