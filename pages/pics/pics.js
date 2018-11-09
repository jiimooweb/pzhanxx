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
    anchor: '',
    page: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var tag_id = options.tag_id
    var name = options.name
    this.setData({
      tag_id: tag_id,
      title: name
    })
    token.verify(this.getPictures)
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  getPictures: function() {
    var tag_id = this.data.tag_id;
    var page = this.data.page
    wx.request({
      url: Config.restUrl + '/pictures/getListByTags?tag_id=' + tag_id,
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
          var pindex = getCurrentPages().length - 1
          app.globalData.pictures[pindex] = newPictures
        }

        if (newPictures.length == res.data.data.total) {
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
  }
})