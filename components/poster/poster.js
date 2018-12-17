// components/poster/poster.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    url: {
      type: String
    }

  },

  // url: {
  //   type: String,
  //   observer: 'download'
  // }

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    tempFilePath:'',
    loadFlag: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    cancel: function() {
      this.setData({
        show: false,
        loadFlag: false
      })
    },

    show: function() {
      this.setData({
        show: true
      })
    },

    load: function(e) {
      wx.hideLoading()
      this.setData({
        loadFlag: true
      })
    },

    save: function() {
      wx.showLoading({
        title: '下载并保存...',
      })
      var url = this.properties.url
      wx.downloadFile({
        url: url,
        success: res => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: res => {
              this.cancel()
              wx.showToast({
                title: '已保存到相册',
                icon: 'none'
              })
            },
            fail: res => {
              this.data.writePhotosAlbum = false
              wx.showToast({
                title: '拒绝授权',
                icon: 'none'
              })
            }
          })
        }
      })
    },

  }
})
