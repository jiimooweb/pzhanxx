import { Config } from "../../../utils/config.js"
import { Token } from "../../../utils/token.js"
//获取应用实例
const app = getApp()
const token = new Token

Page({
  data: {
    socials:[],
    loading: true,
    loadMore: true,
    isLoadMode: true,
    page: 1,
    scrollHeight: 0,
    tipFlag: !wx.getStorageSync('tip_staus'),
    refreshFlag: false,
    anchor: '',
    adsFlag: false,
    adError: false
  },
  

  onLoad: function () {
    token.verify(this.getSocials)
    this.getSystemInfo()
  },

  onShow: function() {
    if (app.globalData.socials.length > 0) {
      this.setData({
        socials: app.globalData.socials
      })
      var update_social = [app.globalData.socials[0]]
      if (update_social[0] != undefined) {
        this.formatSocialImg(update_social)
      }
    }

    if (wx.getStorageSync('point') > 0) {
      wx.showToast({
        title: '发布成功,获得' + wx.getStorageSync('point') + '积分',
        icon: 'none'
      })
      wx.setStorageSync('point', 0)
    }
    
  },

  onReady: function() {
    this.loginPanel = this.selectComponent("#loginPanel");
  },

  onShareAppMessage: function () {
    return {
      title: 'P站星选',
    }
  },

  getSocials: function(page) {
    this.data.isLoadMode = false
    if (page === undefined) {
      page = this.data.page
    }else {
      page = page
    }
    wx.request({
      url: Config.restUrl + '/socials',
      data: {page: page},
      header: {'token': wx.getStorageSync('token')},
      success: res => {
        var socials = res.data.data.data 
        //下拉刷新
        if (this.data.refreshFlag) {
          this.setData({
            socials: [],
            refreshFlag: false
          })
        }
        var o_socials = this.data.socials 
        var new_socoals = []
        if (socials.length > 0) {
          new_socoals = o_socials.concat(socials)
          this.data.isLoadMode = true
          this.data.page = page + 1
          this.setData({
            socials: new_socoals,
            
          });
    
          app.globalData.socials = this.data.socials
          
        }
        
        this.setData({
          loading: false
        })
        
        if (new_socoals.length == res.data.data.total) {
          this.data.isLoadMode = false
          
          this.setData({
            loadMore: false,
            tipFlag: true,
          })
          return
        }

        this.getAds()
      }
    })
  },

  formatSocialImg: function (socials) {
    for (var i in socials) {
      if (socials[i].format != 1) {
        if (socials[i].photos_count === 1) {
          this.formatImg(socials[i].photos[0], i)
        } else {
          var key = 'socials[' + i + '].img_type'
          this.setData({
            [key]: 0
          })
        }
      }
    }
  },
 
  formatImg: function (image, i) {
    wx.getImageInfo({
      src: image.url,
      success: res => {
        var img_type = 0;
        var scale = res.width / res.height;

        if (scale > 1) {
          img_type = 1
        }else if(scale < 1) {
          img_type = 2
        }else {
          img_type = 3
        }

        // image.img_type = img_type
        var key = 'socials[' + i + '].img_type'
        var format_key = 'socials[' + i + '].format'
        this.setData({
          [key]: img_type,
          [format_key]: 1
        })
      }
    })
  },

  like: function(e) {
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    wx.request({
      url:  Config.restUrl + '/socials/' + id+ '/like',
      header: { 'token': wx.getStorageSync('token') },
      method: 'post',
      success: res => {
        if (res.data.status == 'success') {
          var socials = this.data.socials
          var like_count = socials[index].like_fans_count
          var like_key = 'socials[' + index +'].like'
          var like_count_key = 'socials[' + index +'].like_fans_count'
          wx.showToast({
            title: '点赞成功',
            icon: 'success',
          })
          this.setData({
            [like_key]: 1,
            [like_count_key]: like_count + 1
          })
          
        }
      },
    })
  }, 

  toComment: function(e) {
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    var count = this.data.socials[index].comments_count
    wx.navigateTo({
      url: '/pages/socials/comment/comment?index=' + index + '&id=' + id + '&count=' + count + '&key=socials' ,
    })
  },

  preview: function(e) {
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    var socials = this.data.socials
    var urls = this.getPhotoUrls(socials[index].photos)
    wx.previewImage({
      urls: urls,
      current: socials[index].photos[id].url
    })
  },

  getPhotoUrls: function(photos) {
    var urls = []
    for (var i in photos) {
      urls.push(photos[i].url)
    }
    return urls
  },

  toRelease: function() {
    
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }

    if (wx.getStorageSync('black_status')) {
      wx.showToast({
        title: '你已被禁言',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/socials/release/release',
    })
  },

  toSocial: function(e) {
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '/pages/socials/social/social?id=' + id + '&index=' + index + '&key=socials',
    })
  },

  getSystemInfo: function() {
    var _this = this
    wx.getSystemInfo({
      success: function(res) {
        _this.setScrollHeight(res.windowHeight)
      }
    })
  },

  setScrollHeight: function(height) {
    this.setData({
      scrollHeight: height
    })
  },

  lower: function(e) {
    if (!this.data.isLoadMode) {
      return 
    }
    this.getSocials()
    
  },

  getUserInfo: function(e) {

  },

  colseTip: function(e) {
    wx.setStorageSync('tip_staus', true)
    this.setData({
      tipFlag: false
    })
  },

  refresh: function (e) {
    this.setData({
      loadMore: false,
      isLoadMode: false,
      page: 1,
      refreshFlag: true
    }),

    this.getSocials()
  },

  touchstart: function (e) {
    this.data.statusY = e.changedTouches[0].pageY
  },

  touchend: function (e) {
    this.data.endY = e.changedTouches[0].pageY
    if (this.data.endY - this.data.statusY > 150) {
      if (this.data.scroll <= 0 && !this.data.refreshFlag) {
        this.refresh()
      }
    }
  },

  scroll: function (e) {
    var scrollHeight = e.detail.scrollTop
    this.data.scroll = scrollHeight
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

  getAds: function () {
    wx.request({
      url: Config.restUrl + '/ads/app',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var ads = res.data.data
        for(var i in ads) {
          if(ads[i].page == 'Social') {
            this.setData({
              adsFlag: true
            })
            break;
          }
        }
      }
    })
  },

  adError: function (e) {
    this.setData({
      adError: true
    })
  }

  
})
