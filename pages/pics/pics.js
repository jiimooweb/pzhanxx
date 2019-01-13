import { Config } from "../../utils/config.js"
import { Token } from "../../utils/token.js"

const token = new Token
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pictures: [],
    tag_id: 0,
    title: '精选',
    page: 1,
    isLoadMode: true,
    topShow: false,
    anchor: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var tag_id = options.tag_id ? options.tag_id : 0
    var name = options.name
    this.data.type = options.type
    this.setData({
      tag_id: tag_id,
      title: name
    })
    token.verify(this.getPictures)
    this.getSystemInfo()
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  getPictures: function() {
    var page = this.data.page;
    this.data.isLoadMode = false
    var url = '';
    if(this.data.type == 0 ) {
      url = Config.restUrl + '/pictures/get-list-by-tags?tag_id=' + this.data.tag_id
    } else {
      url = Config.restUrl + '/pictures/get-list-by-author?author=' + this.data.title
    }
    wx.request({
      url: url,
      header: { 'token': wx.getStorageSync('token') },
      data: {page: page},
      success: res => {
        var pictures = res.data.data.data
        var oPictures = this.data.pictures
        var newPictures = [];
        if (pictures.length > 0) {
          newPictures = oPictures.concat(pictures)
          this.setData({
            pictures: newPictures,
            page: page + 1,
            isLoadMode: true
          });
        }

        if (pictures.length == 0 || newPictures.length == res.data.data.total) {
          this.setData({
            isLoadMode: false
          });
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

  getSystemInfo: function () {
    wx.getSystemInfo({
      success: res => {
        var system = res.system
        var barHeight = 0;
        if (system.indexOf("iOS") != -1) {
          barHeight = 44
        } else {
          barHeight = 48
        }

        this.setData({
          barHeight: barHeight,
          statusBarHeight: res.statusBarHeight
        })
        var scrollHeight = res.windowHeight - barHeight - res.statusBarHeight
        this.setData({
          sheight: scrollHeight
        })
      },
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
      return
    }
    this.getPictures()
  }
})