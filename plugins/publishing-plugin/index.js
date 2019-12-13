
class darwin {
  constructor(_INK, ipcRenderer) {
    this._INK = _INK;
    this.ipcRenderer = ipcRenderer;
    console.log("Darwin Achieved", _INK, ipcRenderer);
    this.clickEvent = function () {
      console.log('Survival of the fittest');
    }
  }
}

module.exports=darwin;
