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
    pictures: [],
    recommends: [],
    isLoad: true,
    load: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    var index = options.index
    if(options.key != undefined) {
      this.setData({
        id: id
      })
      token.verify(this.getPicture())
      return
    }
    var pictures = this.formartPictures(index)
    this.setData({
      pictures: pictures,
      id: id
    })
    token.verify(this.getFanPictures)
  },

  onShow: function() {
    var pageLength = getCurrentPages().length
    var pLength = app.globalData.pictures.length
    
    if (pageLength < pLength) { 
      app.globalData.pictures.splice(pageLength,1)
    }
    if (this.data.index) {
      this.isCollectdAndLiked()
      this.getPicture()    
      
    }
  },

  formartPictures: function(index) {
    var pictures = []
    var length = 30
    var pindex = getCurrentPages().length - 2
    var globalPictures = pictures.concat(app.globalData.pictures[pindex])
    var glength = globalPictures.length
    var plength = glength - index
    
    if (glength > length && plength < length) {
      var lindex = globalPictures.length - length;
      var picIndex = length - plength
      pictures = globalPictures.splice(lindex, length)
      this.setData({
        index: picIndex
      })
    } else {
      var pictures = globalPictures
      this.setData({
        index: index
      })
    }
    return pictures
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  getPicture: function() {
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id,
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var picture = res.data.data
        var key = 'pictures[' + this.data.index + ']'
        this.setData({
          [key]: picture
        })
        var pindex = getCurrentPages().length - 2
        app.globalData.pictures[pindex][this.data.index] = picture
      }
    })
  },

  getFanPictures: function() {
    wx.request({
      url: Config.restUrl + '/fans/fan_pictures',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        app.globalData.collect_ids = res.data.collect_ids
        app.globalData.like_ids = res.data.like_ids
        this.isCollectdAndLiked()
        this.addHot()
        this.getPicture()                    
      }
    })
  },


  getRecommends: function() {
    wx.request({
      url: Config.restUrl + '/pictures/'+ this.data.id +'/app_show',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        this.setData({
          recommends: res.data.recommends,
          load: true
        })
        var pindex = getCurrentPages().length - 1
        app.globalData.pictures[pindex] = this.data.recommends        
      }
    })
  },

  addHot: function() {
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/add_hot',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        
      }
    })
  },

  isCollectdAndLiked: function() {
    var pictures = this.data.pictures
    var index = this.data.index
    var id = pictures[index].id
    
    var pindex = getCurrentPages().length - 2
    
    var collect_ids = app.globalData.collect_ids
    var like_ids = app.globalData.like_ids

    var collect_fans_count = pictures[index].collect_fans_count
    var like_fans_count = pictures[index].collect_fans_count

    var collect_status = 0
    var like_status = 0
    if (collect_ids.indexOf(id) > -1) {
      collect_status = 1
    } else {
      collect_status = 0   
    }

    if (like_ids.indexOf(id) > -1) {
      like_status = 1
    }else {
      like_status = 0  
    }

    this.setData({
      ['pictures[' + index + '].collect']: collect_status,
      ['pictures[' + index + '].like']: like_status,
      
    })
    app.globalData.pictures[pindex][index].collect = collect_status
    app.globalData.pictures[pindex][index].like = like_status

  },

  previewImage: function(e) {
    var pictures = this.data.pictures
    var index = this.data.index
    
    var url = pictures[index].url
    var urls = this.getPhotoUrls(pictures)
    wx.previewImage({
      urls: urls,
      current: url
    })
  },

  getPhotoUrls: function (photos) {
    var urls = []
    for (var i in photos) {
      urls.push(photos[i].url)
    }
    return urls
  },

 

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

  change: function(e) {
    var index = e.detail.current
    var id = this.data.pictures[index].id
    this.setData({
      recommends: [],
      index: index,
      isLoad: true,
      id: id
    })
    this.isCollectdAndLiked()
    this.addHot()
    this.getPicture()        
  },

  collectHandle: function(e) {
    var op = 'collect'          
    if(this.data.pictures[this.data.index].collect) {
      op = 'uncollect'
    }
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/' + op,
      header: { 'token': wx.getStorageSync('token') },
      method: 'post',
      success: res => {
        if(res.data.status == 'success') {
          var key = 'pictures[' + this.data.index + '].collect'
          var count_key = 'pictures[' + this.data.index + '].collect_fans_count'
          var status = this.data.pictures[this.data.index].collect ? 0 : 1
          var collect_fans_count = this.data.pictures[this.data.index].collect_fans_count
          if (status) {
            collect_fans_count++
          } else {
            collect_fans_count--
          }
          this.setData({
            [key]: status,
            [count_key]: collect_fans_count,
          })
          var pindex = getCurrentPages().length - 2
          app.globalData.pictures[pindex][this.data.index].collect = status
          app.globalData.pictures[pindex][this.data.index].collect_fans_count = collect_fans_count

          if(status == 0) {
            var collect_index = app.globalData.collect_ids.indexOf(parseInt(this.data.id))
            app.globalData.collect_ids.splice(collect_index, 1)
          } else {
            app.globalData.collect_ids.push(parseInt(this.data.id))
          }

        }
      }
    })
  },

  likeHandle: function (e) {
    var op = 'like'
    if (this.data.pictures[this.data.index].like) {
      op = 'unlike'
    }
    wx.request({
      url: Config.restUrl + '/pictures/' + this.data.id + '/' + op,
      header: { 'token': wx.getStorageSync('token') },
      method: 'post',
      success: res => {
        if (res.data.status == 'success') {
          var key = 'pictures[' + this.data.index + '].like'
          var count_key = 'pictures[' + this.data.index + '].like_fans_count'
          var status = this.data.pictures[this.data.index].like ? 0 : 1
          var like_fans_count = this.data.pictures[this.data.index].like_fans_count
          if (status) {
            like_fans_count++
          } else {
            like_fans_count--
          }
          this.setData({
            [key]: status,
            [count_key]: like_fans_count
          })
          var pindex = getCurrentPages().length - 2
          app.globalData.pictures[pindex][this.data.index].like = status   
          app.globalData.pictures[pindex][this.data.index].like_fans_count = like_fans_count                 
          if (status == 0) {
            var like_index = app.globalData.collect_ids.indexOf(parseInt(this.data.id))
            app.globalData.collect_ids.splice(like_index, 1)
          } else {
            app.globalData.collect_ids.push(parseInt(this.data.id))
          }
          
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
    var picture = this.data.pictures[this.data.index]
    var url = 'https://minibizhi.313515.com/WeChat/GenerateSharePicStream?picType=1&picUrl=' + encodeURI(picture.url)

    return {
      'title': picture.title,
      'imageUrl': url,
      'path': 'pages/preview/preview?id=' + this.data.id + '&key=share' 
    }
    
    
  }

// https://minibizhi.313515.com/WeChat/GenerateSharePicStream?picType=1&picUrl=http%3a%2f%2fp8r2g6z46.bkt.clouddn.com%2f20181025%2fca34d094b08eefc14dca8eb83eae2ebe.png
 
})