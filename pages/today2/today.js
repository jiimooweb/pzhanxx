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
    wx.request({
      url: Config.restUrl + '/todays/one',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        console.log(res)
      }
    })
  },

  back: function(e) {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})