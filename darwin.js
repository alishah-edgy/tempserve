
var electron = require('electron');
class darwin {
  constructor(_INK, ipcRenderer) {
    this._INK = _INK;
    this.ipcRenderer = ipcRenderer;
    console.log("Darwin Achieved", _INK, ipcRenderer);
  }
}

module.exports=darwin;
