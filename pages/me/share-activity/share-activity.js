// pages/share-activity/share-activity.js
import { Config } from "../../../utils/config.js"
import { Token } from "../../../utils/token.js"
//获取应用实例
const app = getApp()
const token = new Token
Page({

  /**
   * 页面的初始数据
   */
  data: {
    share_id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUid()
  },
  getUid: function () {
    wx.request({
      url: Config.restUrl + '/getUid',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        this.setData({
          share_id: res.data.uid
        })
      },
    })
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
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }
    var userInfo = wx.getStorageSync('userInfo');
    console.log(this.data.share_id);
    return {
      title: '分享获积分，漫图看不停',
      imageUrl: 'http://download.rdoorweb.com/pzhan/WechatIMG5934.jpeg',
      path: '/pages/me/share/share?share_id=' + this.data.share_id,
    }
  } 
})