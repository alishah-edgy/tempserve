
class darwin {
  constructor(_INK, ipcRenderer) {
    this._INK = _INK;
    this.ipcRenderer = ipcRenderer;
    console.log("Darwin 2.0", _INK, ipcRenderer);
    this.clickEvent = function () {
      console.log('Darwin 2.0 activated');
      _INK["menu-item"]({icon: "abc", name: "test"});
    }
  }
}

module.exports=darwin;
