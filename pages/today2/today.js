import { Config } from "../../utils/config.js"
import { Token } from "../../utils/token.js"
//获取应用实例
const app = getApp()
const token = new Token

Page({

  /**
   * 页面的初始数据
   */
  data: {
    todays: [],
    load: true,
    id: 0,
    current: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.id) {
      this.setData({
        id: options.id
      })
    }
    token.verify(this.getToday)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  change: function(e) {
    this.setData({
      current:e.detail.current
    })
  },

 
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    var today = this.data.todays[this.data.current]
    return {
      'title': today.text,
      'imageUrl': today.picture.url,
      'path': 'pages/today2/today?id=' + today.id
    }
  },

  getToday: function() {
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: Config.restUrl + '/todays/one',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var todays = res.data.data
        this.setData({
          todays: todays
        })
        this.setCurrent(todays)
      }
    })
  },

  setCurrent: function(data) {
    var id = this.data.id
    for(var i in data) {
      if(data[i].id == id) {
        this.setData({
          current: i
        })
        break;
      }
    }
  },

  back: function(e) {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  load: function(e) {
    wx.hideLoading()
    this.setData({
      load: false
    })
  },

  toPreview: function(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/preview/preview?id=' + id,
    })
  }
})