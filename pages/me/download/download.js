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
    title: '我的下载',
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

    if (this.data.id > 0 && app.globalData.pictures.length > 0) {
      // token.verify(this.getPicture)
      this.setData({
        pictures: app.globalData.pictures
      })
      app.globalData.pictures = []
    }

  },

  getPicture: function () {
    var id = this.data.id
    wx.request({
      url: Config.restUrl + '/pictures/' + id,
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var picture = res.data.data

        var pictures = this.data.pictures
        for (var i in pictures) {
          if (pictures[i].id == id) {
            var key = 'pictures[' + i + ']'
            this.setData({
              [key]: picture
            })
            break;
          }
        }

      }
    })
  },

  toPreview: function (e) {
    this.data.id = e.detail.id
    app.globalData.pictures = this.data.pictures
  },

  collect: function (e) {
    this.data.id = e.detail.id
    this.setPictures(1)
  },

  uncollect: function (e) {
    this.data.id = e.detail.id
    this.setPictures(0)
  },

  setPictures: function (status) {
    var pictures = this.data.pictures
    for (var i in pictures) {
      if (pictures[i].id == this.data.id) {
        var key = 'pictures[' + i + '].collect'
        this.setData({
          [key]: status
        })
        break;
      }
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
      url: Config.restUrl + '/fans/' + fan_id + '/download',
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