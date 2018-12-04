import {
  Config
} from "../../utils/config.js"
import {
  Token
} from "../../utils/token.js"
const token = new Token
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    index: 0,
    picture: [],
    recommends: [],
    isLoad: true,
    load: false,
    downloadFlag: false,
    recommend_ids: [],
    writePhotosAlbum: false,
    authorizeFlag: false,
    share: false,
    scrollHeight: 0,
    adsFlag: false,
    adError: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    var index = options.index
    this.setData({
      id: id
    })

    wx.getSystemInfo({
      success: res => {
        this.setData({
          scrollHeight: res.windowHeight
        });
      }
    });

    if (options.key != undefined) {
      token.verify(this.getPictureAndRecommends)
      return
    }
    token.verify(this.getPictureAndRecommends)


  },


  onShow: function () {
    var that = this

    if (this.data.recommend_ids.length > 0) {
      token.verify(this.getPictureAndRecommendsByIds)
    }

    setTimeout(this.init, 400);


  },

  init: function () {
    wx.getSetting({
      success: res => {
        this.data.writePhotosAlbum = res.authSetting['scope.writePhotosAlbum']
      },
    })

    //分享后进入页面的时候
    if (this.data.share && this.data.picture.download == 0) {
      wx.showLoading({
        title: '正在下载...',
      })
      this.downloadPicture()
      this.data.share = false
    }
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.loginPanel = this.selectComponent("#loginPanel");
  },


  getPictureAndRecommendsByIds: function () {
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/app_show',
      header: {
        'token': wx.getStorageSync('token')
      },
      data: {
        recommend_ids: this.data.recommend_ids
      },
      method: 'POST',
      success: res => {
        var picture = res.data.data
        var recommends = res.data.recommends
        this.setData({
          picture: picture,
          recommends: recommends,
          load: true
        })
      }
    })
  },


  getPictureAndRecommends: function () {
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/app_show',
      header: {
        'token': wx.getStorageSync('token')
      },
      success: res => {
        var recommends = res.data.recommends
        var recommend_ids = res.data.recommend_ids
        this.setData({
          picture: res.data.data,
          recommends: recommends,
          recommend_ids: recommend_ids,
          load: true
        })
        this.getAds()


      }
    })
  },


  // previewImage: function(e) {
  //   var picture = this.data.picture
  //   var index = this.data.index

  //   var url = picture.url
  //   var urls = [url]
  //   wx.previewImage({
  //     urls: urls,
  //     current: url
  //   })
  // },




  scroll: function (e) {
    var scrollHeight = e.detail.scrollTop
    if (scrollHeight > 250) {
      if (this.data.recommends.length === 0 && this.data.isLoad) {
        this.getRecommends()
        this.setData({
          isLoad: false
        })
      }
    }
  },

  collectHandle: function (e) {
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }
    var op = 'collect'
    if (this.data.picture.collect) {
      op = 'uncollect'
    }
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/' + op,
      header: {
        'token': wx.getStorageSync('token')
      },
      method: 'post',
      success: res => {
        if (res.data.status == 'success') {
          var key = 'picture.collect'
          var count_key = 'picture.collect_fans_count'
          var status = this.data.picture.collect ? 0 : 1
          var collect_fans_count = this.data.picture.collect_fans_count
          if (status) {
            collect_fans_count++
          } else {
            collect_fans_count--
          }
          this.setData({
            [key]: status,
            [count_key]: collect_fans_count,
          })
          this.setGPictures(this.data.id, status)
        }
      }
    })
  },

  likeHandle: function (e) {
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }
    var op = 'like'
    if (this.data.picture.like) {
      op = 'unlike'
    }
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/' + op,
      header: {
        'token': wx.getStorageSync('token')
      },
      method: 'post',
      success: res => {
        if (res.data.status == 'success') {
          var key = 'picture.like'
          var count_key = 'picture.like_fans_count'
          var status = this.data.picture.like ? 0 : 1
          var like_fans_count = this.data.picture.like_fans_count
          if (status) {
            like_fans_count++
          } else {
            like_fans_count--
          }
          this.setData({
            [key]: status,
            [count_key]: like_fans_count
          })

        }
      }
    })
  },

  toHome: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  setShareFlag: function () {
    this.data.share = true
    this.data.type = 1
  },

  onShareAppMessage: function () {
    var picture = this.data.picture

    return {
      'title': picture.title,
      'imageUrl': picture.url,
      'path': 'pages/preview/preview?id=' + this.data.id + '&key=share'
    }

  },

  showDownloadPanel: function () {

    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }

    if (this.data.writePhotosAlbum === false) {
      this.showAuthorizePanel()
      return
    }
    if (this.data.picture.download) {
      this.downloadPicture()
      return
    }

    this.getPointAndShareCount()

  },

  hideDownloadPanel: function () {
    this.setData({
      downloadFlag: false
    })
  },

  showAuthorizePanel: function () {
    this.setData({
      authorizeFlag: true
    })
  },

  hideAuthorizePanel: function () {
    this.setData({
      authorizeFlag: false
    })
  },

  getPointAndShareCount: function () {
    wx.request({
      url: Config.restUrl + '/fan/point-and-share-count',
      header: {
        'token': wx.getStorageSync('token')
      },
      success: res => {
        this.setData({
          point: res.data.point,
          share_count: res.data.share_count
        })
        this.setData({
          downloadFlag: true
        })
      }
    })
  },

  download: function (e) {
    var dtype = this.data.type ? 1 : 0;
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/download',
      header: {
        'token': wx.getStorageSync('token')
      },
      data: { 'type': dtype },
      method: 'post',
      success: res => {
        console.log(res)
        if (res.data.status == 'success') {
          if (res.data.flag) {
            this.downloadPicture()
            this.data.picture.download = 1
          }
        }
      }
    })
  },


  downloadPicture: function () {
    this.hideDownloadPanel()
    // wx.showLoading({
    //   title: '正在下载...',
    // })
    var url = this.data.picture.url
    const downloadTask = wx.downloadFile({
      url: url, //仅为示例，并非真实的资源
      success: res => {
        var tempFilePath = res.tempFilePath;
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: res => {
            wx.hideLoading()
            this.hideDownloadPanel()
            wx.showToast({
              title: '已保存到相册',
              icon: 'none'
            })
          },
          fail: res => {
            wx.hideLoading()
            this.hideDownloadPanel()
            this.data.writePhotosAlbum = false
            wx.showToast({
              title: '拒绝授权',
              icon: 'none'
            })
          }
        })
      },

      fail: res => {
        wx.hideLoading()
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    })

    downloadTask.onProgressUpdate((res) => {
      wx.showLoading({
        title: '已下载' + res.progress + '%',
      })

      if (res.progress == 100) {
        wx.hideLoading()
      }
    })


  },

  setGPictures: function (id, status) {
    var gPitures = app.globalData.pictures
    for (var i in gPitures) {
      if (gPitures[i].id == id) {
        app.globalData.pictures[i].collect = status
        break;
      }
    }
  },

  loadImage: function (e) {
    wx.hideLoading()
  },

  getAds: function () {
    wx.request({
      url: Config.restUrl + '/ads/app',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var ads = res.data.data
        for (var i in ads) {
          if (ads[i].page == 'Preview') {
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


  // https://minibizhi.313515.com/WeChat/GenerateSharePicStream?picType=1&picUrl=http%3a%2f%2fp8r2g6z46.bkt.clouddn.com%2f20181025%2fca34d094b08eefc14dca8eb83eae2ebe.png

})