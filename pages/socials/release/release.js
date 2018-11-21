import { Config } from "../../../utils/config.js"
import { Token } from "../../../utils/token.js"


var app = getApp()
const token = new Token

// const dir = wx.env.USER_DATA_PATH
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photos: [],
    addFlag: true,
    photo_index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    token.verify(this.callback)
  },

  // onShareAppMessage: function () {
  //   return {
  //     title: 'P站星选',
  //   }
  // },

  selectPhoto: function() {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        if(tempFilePaths.length == 9) {
          this.setData({
            addFlag: false
          })
        }
        this.setData({
          photos: tempFilePaths
        })
      },
    })
  },

  preview: function (e) {
    var url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: this.data.photos,
      current: url
    })
  },

  deletePhoto: function(e) {
    var index = e.currentTarget.dataset.index
    var photos = this.data.photos
    photos.splice(index, 1)

    this.setData({
      photos: photos,
      addFlag: true
    })
  },

  formSocial: function (e) {
    
    var content = e.detail.value.content
    var photos = this.data.photos
    if (content == '' && photos.length == 0) {
      wx.showToast({
        title: '内容和相片不能为空',
        icon: 'none',
      })
      return
    }
    wx.showLoading({
      title: '正在发布',
      mask: true
    })
    wx.request({
      url: Config.restUrl + '/socials',
      data: { 'content': content,},
      header: { 'token': wx.getStorageSync('token') },
      method: 'POST',
      success: res => {
        if (res.data.status == 'success') {
          var social = res.data.data
          var point = res.data.point
          var new_photos = []
          for(var i=0; i < photos.length; i++) {
            new_photos[i] = {}
          }

          if (photos != null || photos != undefined ) {
            for(var i in photos) {
              new_photos[i].url = photos[i]
            }
          }
          
          this.uploadFile(new_photos, social.id, this.uploadFile)
          
          social['photos'] = new_photos
          social['photos_count'] = new_photos.length
          social['new'] = 1
          app.globalData.socials.unshift(social)

          if (point > 0) {
            wx.setStorageSync('point', point)
          }

          wx.navigateBack({
            delta: 1
          })
        }
      }
    })
  },

  uploadFile: function(fliePath,social_id, callback) {
    var photo_index = this.data.photo_index
    if (fliePath[photo_index] != undefined) {
      wx.uploadFile({
        url: Config.restUrl + '/socials/uploadPhoto', //仅为示例，非真实的接口地址
        filePath: fliePath[photo_index].url,
        header: { 'token': wx.getStorageSync('token') },        
        name: 'file',
        formData: {
          'social_id': social_id,
          'fan_id': 3
        },
        success: res => {
          this.setData({
            photo_index: ++photo_index
          })
          callback(fliePath, social_id, this.uploadFile)
        }
      })
    }else {
      this.setData({
        photo_index: 0
      })
      return
    }
   
  },

  callback: function() {
    
  }


 
})