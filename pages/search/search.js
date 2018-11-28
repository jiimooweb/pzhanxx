import { Config } from "../../utils/config.js"
import { Token } from "../../utils/token.js"

const token = new Token
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tags:[],
    value: "",
    cancelFlag: false,
    history: [],
    orderIndex: 0,
    searchFlag: false,
    news: {
      pictures: [],
      page: 1,
      isLoadMore: true,
      topShow: false
    },
    olds: {
      pictures: [],
      page: 1,
      isLoadMore: true,
      topShow: false
    },
    scrollHeight: 0,
    topShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getStatusBarHeight();
    this.setData({
      history: wx.getStorageSync('history') ? wx.getStorageSync('history') : []
    })
    token.verify(this.getTags);
    
  },

  onShow: function() {
    if(this.data.id > 0 && app.globalData.pictures.length > 0) {
      if(this.data.orderIndex == 0) {
        this.setData({
          ['news.pictures']: app.globalData.pictures
        })
      } else {
        this.setData({
          ['olds.pictures']: app.globalData.pictures
        })
      }
      app.globalData.pictures = []
    }
  },

  getStatusBarHeight: function() {
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
        var scrollHeight = res.windowHeight - barHeight - res.statusBarHeight - 40
        this.setData({
          scrollHeight: scrollHeight
        })
      },
    })
  },

  getTags: function () {
    wx.request({
      url: Config.restUrl + '/tags/hot',
      header: { 'token': wx.getStorageSync('token') },
      method: 'get',
      success: res => {
        var tags = res.data.data
        this.setData({
          tags: tags
        })
      }
    })
  },

  empty: function() {
    this.setData({
      value: "",
      cancelFlag: false      
    })
  },

  bindinput: function(e) {
    if(e.detail.value != "") {
      this.setData({
        cancelFlag: true
      })
    }
  },

  bindconfirm: function(e) {
    this.initData()   
    var value = e.detail.value
    var history = this.data.history
    if (history.indexOf(value) == -1) {
      history.unshift(value)      
    } 
    if(history.length > 7) {
      history.splice(history.length - 1,1);
    }
    this.setData({
      history: history,
      value: value,
      searchFlag: true
    })
    wx.setStorageSync('history', history)
    this.getPictures()
  },

  searchHistory: function(e) {
    var value = e.currentTarget.dataset.value
    this.setData({
      value: value,
      searchFlag: true
    })
    this.getPictures()    
  },

  delHistory: function(e) {
    var index = e.currentTarget.dataset.index
    var history = this.data.history;
    history.splice(index, 1)
    this.setData({
      history: history
    })
    wx.setStorageSync('history', history)
  },

  getPictures: function() {
    var orderIndex = this.data.orderIndex
    if (this.data.orderIndex == 0) {
      this.data.news.isLoadMore = false
      var page = this.data.news.page
    } else {
      this.data.olds.isLoadMore = false
      var page = this.data.olds.page
    }
    wx.request({
      url: Config.restUrl + '/pictures/search',
      header: { 'token': wx.getStorageSync('token') },      
      data: { 'keyword': this.data.value, 'page': page, 'order': orderIndex},
      success: res => {
        if (this.data.orderIndex == 0) {
          var pictures = res.data.data
          var oPictures = this.data.news.pictures
          var newPictures = [];

          if (pictures.length > 0) {
            newPictures = oPictures.concat(pictures)
            this.data.news.isLoadMore = true
            this.data.news.page = page + 1
            this.setData({
              ['news.pictures']: newPictures,
            });
          } 

          if (newPictures.length == res.data.total) {
            this.data.news.isLoadMore = false
            this.setData({
              ['news.isLoadMore']: false
            })
          }
        } else {
          var pictures = res.data.data
          var oPictures = this.data.olds.pictures
          var newPictures = [];

          if (pictures.length > 0) {
            newPictures = oPictures.concat(pictures)
            this.data.olds.isLoadMore = true
            this.data.olds.page = page + 1
            this.setData({
              ['olds.pictures']: newPictures,
            });
          }

          if (newPictures.length == res.data.total) {
            this.data.olds.isLoadMore = false
            this.setData({
              ['olds.isLoadMore']: false
            })
          }
        }
      }
    })
  },

  back: function() {
    if(this.data.searchFlag) {
      this.setData({
        searchFlag:false,
      })
      this.initData()
    }else {
      wx.navigateBack({
        delta: 1
      })
    }
  },

  changeOrder: function(e) {
    if (e.target.dataset.index != undefined) {
      this.setData({
        orderIndex: e.target.dataset.index
      })
      if (this.data.orderIndex == 0) {
        if (!this.data.news.isLoadMore) {
          return
        }
      } else {
        if (!this.data.olds.isLoadMore) {
          return
        }
      }
      this.getPictures()
    }
  },

  scroll: function(e) {
    var scrollHeight = e.detail.scrollTop
    if(this.data.orderIndex == 0 ) {
      var key = 'news.topShow'
    }else {
      var key = 'olds.topShow'
    }
    if (scrollHeight > 2000) {
      this.setData({
        [key]: true
      })
    } else {
      this.setData({
        [key]: false
      })
    }
  },

  loadMore: function() {
    if (this.data.orderIndex == 0) {
      if(!this.data.news.isLoadMore) {
        return
      }
    }else {
      if (!this.data.olds.isLoadMore) {
        return
      }
    }
    this.getPictures()
  },

  toPreview: function(e) {
    this.data.id = e.detail.id
    if (this.data.orderIndex == 0) {
      app.globalData.pictures = this.data.news.pictures
    }else {
      app.globalData.pictures = this.data.olds.pictures
    }
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
    if(this.data.orderIndex == 0) {
      var pictures = this.data.news.pictures   
    }else {
      var pictures = this.data.olds.pictures      
    }
    for (var i in pictures) {
      if (pictures[i].id == this.data.id) {
        if (this.data.orderIndex == 0) {
          var key = 'news.pictures[' + i + '].collect'
        } else {
          var key = 'olds.pictures[' + i + '].collect'
        }
        this.setData({
          [key]: status
        })
        break;
      }
    }
  },

  initData: function() {
    this.setData({
      ['news.pictures']: [],
      ['news.page']: 1,
      ['news.isLoadMore']: true,
      ['olds.pictures']: [],
      ['olds.page']: 1,
      ['olds.isLoadMore']: true,
      orderIndex: 0
    })
  },

  toTop: function () {
    this.setData({
      anchor: 'anchor'
    })
  },


  
  
})