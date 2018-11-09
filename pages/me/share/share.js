// pages/share/share.js
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
    shareUserInfo: {},
    share_id:3,
    share_img:'',
    beshare_id:'',
    share_histroy:[],
    button_flag:true,
    loading: true,
    statusBarHeight: 0,
    barHeight: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    this.init()
    var share_id = options.share_id;
    this.setData({
      share_id: share_id,
    });
    token.verify(this.getUid)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.loginPanel = this.selectComponent("#loginPanel");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  init: function () {
    var _this = this
    wx.getSystemInfo({
      success: function (res) {
        var system = res.system
        var barHeight = 0;
        if (system.indexOf("iOS") != -1) {
          barHeight = 44
        } else {
          barHeight = 48
        }

        _this.setData({
          barHeight: barHeight,
          statusBarHeight: res.statusBarHeight
        })
      }
    })
  },

  getUid: function () {
    
    wx.request({
      url: Config.restUrl + '/getUid',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var beshare_id = res.data.uid
        this.setData({
          beshare_id: beshare_id
        })
        this.getUserInfo(this.data.share_id)
        this.showShare()
        
      },
    })
  },

  getUserInfo: function(id) {
    wx.request({
      url: Config.restUrl + '/getUserInfo?fan_id=' + id,
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        this.setData({
          shareUserInfo:  res.data.data
        })
      },
    })
  },

  showShare:function(){
    wx.request({
      url: Config.restUrl + '/share_show',
      data: { fan_id: this.data.share_id },
      method: 'post',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var data = res.data
        this.setData({
          share_histroy: data.data.share_data.data,
          button_flag:data.data.share_flag
        });
        wx.hideLoading()
      }
    })
  },

  toAddPoint: function () {
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }
    var share_id=this.data.share_id;
    wx.showLoading({
      title: '正在加分',
      mask: true
    })
    wx.request({
      url: Config.restUrl + '/share',
      data: { fan_id: share_id },
      method:'post',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var data = res.data
        wx.hideLoading();
        console.log(data);
        if (data.status =='repeat'){
          wx.showToast({ title: data.msg, icon:'none'});
        } else if (data.status =='success'){
          this.showShare();
        }
      }
    })
  },

  onShareAppMessage:function(){
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }
    var userInfo = wx.getStorageSync('userInfo');
    return {
      title: '分享获积分，漫图看不停',
      imageUrl:'http://download.rdoorweb.com/pzhan/WechatIMG5934.jpeg',
      path: '/pages/me/share/share?share_id=' + this.data.beshare_id,
    }
  },

  toHome: function() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  } 


})