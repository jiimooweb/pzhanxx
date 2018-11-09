import { Config } from "../../../utils/config.js"
import { Token } from "../../../utils/token.js"

const token = new Token
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pictures: [],
    fan_id: 0,
    title: '我的收藏',
    page: 1,
    isLoadMode: true,
    topShow: false,
    anchor: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    token.verify(this.getUid)
  },

  getUid: function () {
    wx.request({
      url: Config.restUrl + '/getUid',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        this.setData({
          fan_id: res.data.uid
        })
        this.getPictures()
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
    var pindex = getCurrentPages().length - 1
    if (app.globalData.pictures.length > 1 && this.data.fan_id > 0) {
      var pictures = app.globalData.pictures[pindex]

      for(var i in pictures) {
        if(pictures[i].collect == 0) {
          pictures.splice(i,1)
        }
      }      
      this.setData({
        pictures: pictures
      })      
    }


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  getPictures: function () {
    var fan_id = this.data.fan_id;
    var page = this.data.page
    wx.request({
      url: Config.restUrl + '/fans/' + fan_id +'/collect',
      header: { 'token': wx.getStorageSync('token') },
      data: { page: page },
      success: res => {
        var pictures = res.data.data
        var oPictures = this.data.pictures
        var newPictures = [];
        if (pictures.length > 0) {
          newPictures = oPictures.concat(pictures)
          this.setData({
            pictures: newPictures,
            page: page + 1,
            isLoadMode: true
          });
          var pindex = getCurrentPages().length - 1
          app.globalData.pictures[pindex] = newPictures
        }

        if (newPictures.length == res.data.total) {
          this.setData({
            isLoadMode: false
          });
        }
      }
    })
  },

  scroll: function (e) {
    var scrollHeight = e.detail.scrollTop

    if (scrollHeight > 2000) {
      this.setData({
        topShow: true
      })
    } else {
      this.setData({
        topShow: false
      })
    }
  },

  toTop: function () {
    this.setData({
      anchor: 'anchor'
    })
  },


  loadMore: function (e) {
    if (!this.data.isLoadMode) {
      this.setData({
        isLoadMode: false
      })
      return
    }
    this.getPictures()
  },


})