
class darwin {
  constructor(_INK, ipcRenderer) {
    this._INK = _INK;
    this.ipcRenderer = ipcRenderer;
    console.log("Darwin 2.0", _INK, ipcRenderer);
    _INK["menu-item"]({icon: "abc", name: "test"});
    this.clickEvent = function () {
      console.log('Darwin 2.0 activated');
    }
  }
}

module.exports=darwin;
