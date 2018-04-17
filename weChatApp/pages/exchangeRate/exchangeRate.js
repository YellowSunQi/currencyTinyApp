const app = getApp();
var curDict = require('./curDict.js');
Page({
  data: {
    curDict: curDict.curDict,
    curSourceIndex: 0,
    curTargetIndex: 0,
    rate: '1.000',
    inputData:0,
    resultData:0
  },
  curSourceChange: function (e) {
    this.setData({
      curSourceIndex: e.detail.value
    })
  },
  curTargetChange: function (e) {
    this.setData({
      curTargetIndex: e.detail.value
    })
  },
  requestCurrency: function (e) {
    let sourceName = this.data.curDict[this.data.curSourceIndex].curShortName,
      targetName = this.data.curDict[this.data.curTargetIndex].curShortName,
      _this = this;
    wx.request({
      url: `https://sapi.k780.com/?app=finance.rate&scur=${sourceName}&tcur=${targetName}&appkey=32854&sign=322588d7ab4c69f2bb084edae714a251&format=json`,
      success: function (res) {
        console.log(res.data)
        _this.setData({
          rate: parseFloat(res.data.result.rate).toFixed(3),
          update: res.data.result.update
        }, () => {
          _this.setData({
            resultData: (_this.data.inputData * _this.data.rate).toFixed(3)
          })
          wx.setStorage({
            key: sourceName + "/" + targetName,
            data: {
              sourceName: sourceName,
              targetName: targetName,
              rate: _this.data.rate,
              timeStamp: Math.round(new Date() / 1000)
            }
          })
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '出错了',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  calculateRate: function () {
    let sourceName = this.data.curDict[this.data.curSourceIndex].curShortName,
      targetName = this.data.curDict[this.data.curTargetIndex].curShortName,
      _this = this;
    if (this.data.update) {
      if (wx.getStorageSync(sourceName + "/" + targetName) && Math.round(new Date() / 1000) - parseInt(wx.getStorageSync(sourceName + "/" + targetName).timeStamp) < 300) {
        console.log(wx.getStorageSync(sourceName + "/" + targetName) && Math.round(new Date() / 1000) - parseInt(wx.getStorageSync(sourceName + "/" + targetName).timeStamp))
        this.setData({
          rate: parseFloat(wx.getStorageSync(sourceName + "/" + targetName).rate).toFixed(3),
        },()=>{
          this.setData({
            resultData: (this.data.inputData * this.data.rate).toFixed(3)
          })
        })
      }
      else if (wx.getStorageSync(targetName + "/" + sourceName) && Math.round(new Date() / 1000) - parseInt(wx.getStorageSync(targetName + "/" + sourceName).timeStamp) < 300) {
        console.log(wx.getStorageSync(targetName + "/" + sourceName) && Math.round(new Date() / 1000) - parseInt(wx.getStorageSync(targetName + "/" + sourceName).timeStamp))
        this.setData({
          rate: (1 / parseFloat(wx.getStorageSync(targetName + "/" + sourceName).rate)).toFixed(3),
        }, () => {
          this.setData({
            resultData: (this.data.inputData * this.data.rate).toFixed(3)
          })
        })
      }
      else {
        this.requestCurrency();
      }
    }
    else {
      this.requestCurrency();
    }
  },
  exchangeSourceAndTarget: function () {
    this.setData({
      curSourceIndex: this.data.curTargetIndex,
      curTargetIndex: this.data.curSourceIndex
    })
  },
  setInputData:function(e){
    this.setData({
      inputData: e.detail.value
    })
  },
  inputSearchData:function(e){
    this.setData({
      searchData:e.detail.value
    })
  },
  searchData:function(){
    for (let i = 0; i < this.data.curDict.length;i++){
      if (this.data.curDict[i].curShortName == this.data.searchData || this.data.curDict[i].curSpellCode.indexOf(this.data.searchData) !== -1){
        console.log(i, this.data.curDict[i].curShortName, this.data.curDict[i].curName)
      }
    }
  },
  clearStorage: function () {
    wx.clearStorage()
  }
})