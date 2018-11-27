import { Config } from '../../utils/config.js';
import { Token } from "../../utils/token.js"
var WxParse = require('../../wxParse/wxParse.js');

const token = new Token

Page({

  /**
   * 页面的初始数据
   */
  data: {
    article: [],
    id: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    token.verify(this.getArticle)
  },

  getArticle: function() {
    var id = this.data.id
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: Config.restUrl + '/articles/' + id,
      method: 'GET',
      header: {'token': wx.getStorageSync('token')},
      success: res => {
        var article = res.data.data
        var that = this;
        WxParse.wxParse('wxParse', 'html', article.content, that, 20);
        that.setData({
          article: article
        })
        wx.hideLoading()
      }
    })
  }
})