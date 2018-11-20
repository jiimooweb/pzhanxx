import { Config } from "../../utils/config.js"
import { Token } from "../../utils/token.js"
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
    recommend_ids: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })

    var id = options.id
    var index = options.index
    this.setData({
      id: id
    })
    if(options.key != undefined) {
      token.verify(this.getPicture)
      return
    }
    token.verify(this.getPictureAndRecommends)
    
  },

  onShow: function() {
    if(this.data.recommend_ids.length > 0) {
      token.verify(this.getPictureAndRecommendsByIds)
    }
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  getPictureAndRecommendsByIds: function() {
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/app_show',
      header: { 'token': wx.getStorageSync('token') },
      data: { recommend_ids: this.data.recommend_ids},
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


  getPictureAndRecommends: function() {
    wx.request({
      url: Config.restUrl + '/pictures/'+ this.data.id +'/app_show',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var recommends = res.data.recommends
        var recommend_ids = res.data.recommend_ids
        this.setData({
          picture: res.data.data,
          recommends: recommends,
          recommend_ids: recommend_ids,
          load: true
        })      
        
        wx.hideLoading()
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


 

  scroll: function(e) {
    var scrollHeight = e.detail.scrollTop
    if (scrollHeight > 250) {
      if(this.data.recommends.length === 0 && this.data.isLoad) {
        this.getRecommends()         
        this.setData({
          isLoad: false
        })
      }
    } 
  },

  collectHandle: function(e) {
    var op = 'collect'          
    if(this.data.picture.collect) {
      op = 'uncollect'
    }
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/' + op,
      header: { 'token': wx.getStorageSync('token') },
      method: 'post',
      success: res => {
        if(res.data.status == 'success') {
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

        }
      }
    })
  },

  likeHandle: function (e) {
    var op = 'like'
    if (this.data.picture.like) {
      op = 'unlike'
    }
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/' + op,
      header: { 'token': wx.getStorageSync('token') },
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

  onShareAppMessage: function() {
    var picture = this.data.picture
    // var url = 'https://minibizhi.313515.com/WeChat/GenerateSharePicStream?picType=1&picUrl=' + encodeURI(this.data.picture.url)

    return {
      'title': picture.title,
      'imageUrl': picture.url,
      'path': 'pages/preview/preview?id=' + this.data.id + '&key=share' 
    }
    
  },

  showDownloadPanel: function() {
    this.setData({
      downloadFlag: true
    })
  },

  hideDownloadPanel: function () {
    this.setData({
      downloadFlag: false
    })
  },

  download: function() {
    wx.showLoading({
      title: '正在下载...',
    })
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/download',
      header: { 'token': wx.getStorageSync('token') },
      method: 'post',
      success: res => {
        if(res.data.status == 'success') {
          var url = res.data.url
          wx.downloadFile({
            url: url,
            success: res => {
              var tempFilePath = res.tempFilePath;
              wx.saveImageToPhotosAlbum({
                filePath: tempFilePath,
                success: res => {
                  wx.hideLoading()
                  wx.showToast({
                    title: '已保存到相册',
                    icon: 'none'
                  })
                  this.delPic()
                }
              })
            },
            fail: res => {
              this.delPic()
              wx.showToast({
                title: '拒绝授权',
                icon: 'none'
              })      
            }
          })
        }
      }
    })
  },

  delPic: function() {
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/del-pic',
      header: { 'token': wx.getStorageSync('token') },
      method: 'post',
      success: res => {

      }
    })
  }

// https://minibizhi.313515.com/WeChat/GenerateSharePicStream?picType=1&picUrl=http%3a%2f%2fp8r2g6z46.bkt.clouddn.com%2f20181025%2fca34d094b08eefc14dca8eb83eae2ebe.png
 
})