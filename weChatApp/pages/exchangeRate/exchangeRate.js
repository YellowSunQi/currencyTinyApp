const app = getApp();
var curDict = require('./curDict.js');
Page({
  data: {
    curDict: curDict.curDict,
    curSourceIndex: 0,
    curTargetIndex: 0,
    rate: '1.000',
    inputData: 0,
    resultData: 0,
    isShow: false
  },
  // 点击选项时更新view中的数组索引达到同步
  curSourceChange: function (e) {
    this.setData({
      curSourceIndex: e.detail.value
    })
  },
  // 点击选项时更新view中的数组索引达到同步
  curTargetChange: function (e) {
    this.setData({
      curTargetIndex: e.detail.value
    })
  },
  // 请求接口获取汇率
  requestCurrency: function (e) {
    let sourceName = this.data.curDict[this.data.curSourceIndex].curShortName,
      targetName = this.data.curDict[this.data.curTargetIndex].curShortName,
      _this = this;
    wx.request({
      url: `https://sapi.k780.com/?app=finance.rate&scur=${sourceName}&tcur=${targetName}&appkey=32854&sign=322588d7ab4c69f2bb084edae714a251&format=json`,
      success: function (res) {
        console.log(res.data)
        _this.setData({
          // 拿到货币汇率和更新时间
          rate: parseFloat(res.data.result.rate).toFixed(3),
          update: res.data.result.update
        }, () => {
          _this.setData({
            // 最终展示为汇率*用户输入金额
            resultData: (_this.data.inputData * _this.data.rate).toFixed(3)
          })
          // 因为接口每小时只能调用50次且数据变动不大，所以请求完把数据缓存下来，记录下时间戳
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
    // 判断update（汇率更新时间）是否存在，因为首次进入界面，update是空的
    // 已存在
    if (this.data.update) {
      // 如果缓存内已经有数据，且数据是5分钟内（时间戳间隔<300），直接取缓存的汇率值去计算
      if (wx.getStorageSync(sourceName + "/" + targetName) && Math.round(new Date() / 1000) - parseInt(wx.getStorageSync(sourceName + "/" + targetName).timeStamp) < 300) {
        this.setData({
          rate: parseFloat(wx.getStorageSync(sourceName + "/" + targetName).rate).toFixed(3),
        }, () => {
          this.setData({
            resultData: (this.data.inputData * this.data.rate).toFixed(3)
          })
        })
      }
      // 如果缓存内已经有数据（只是源汇率和目标汇率相反），且数据是5分钟内（时间戳间隔<300），直接取缓存的汇率值的倒数去计算
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
      // 不符合上述两种情况，都要重新请求接口获得数据
      else {
        this.requestCurrency();
      }
    }
    // 界面没有更新数据时，也要重新请求接口获得数据
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
  setInputData: function (e) {
    this.setData({
      inputData: e.detail.value
    })
  },
  inputSearchData: function (e) {
    this.setData({
      searchData: e.detail.value
    }, () => {
      this.searchData();
    })
  },
  searchData: function () {
    for (let i = 0; i < this.data.curDict.length; i++) {
      if (this.data.curDict[i].curShortName == this.data.searchData || this.data.curDict[i].curSpellCode.indexOf(this.data.searchData) !== -1) {
        console.log(i, this.data.curDict[i].curShortName, this.data.curDict[i].curName)
      }
    }
  },
  addCover: function () {
    var that = this;
    that.animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out',
      transformOrigin: '0 0',
    })
    that.animation.translateY('-30.5rem').step();
    that.setData({
      animationData: that.animation.export(),
    }, () => {
      that.setData({
        isShow: true
      })
    })
  },
  removeCover: function () {
    var that = this;
    that.animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out',
      transformOrigin: '0 0',
    })
    that.animation.translateY('30.5rem').step();
    that.setData({
      animationData: that.animation.export(),
    }, () => {
      that.setData({
        isShow: false
      })
    })
  },
  gotoSearchFromSource:function(){
    wx.navigateTo({
      url: './../searchPage/searchPage?id=1',
    })
  },
  clearStorage: function () {
    wx.clearStorage()
  }
})