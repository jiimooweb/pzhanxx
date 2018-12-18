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
    load: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getToday()
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

 
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getToday: function() {
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: Config.restUrl + '/todays/one',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        this.setData({
          todays: res.data.data
        })
        console.log(this.data.todays)
      }
    })
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