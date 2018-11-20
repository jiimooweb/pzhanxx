import { Config } from "../../utils/config.js"

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pictures: {
      type: Array,
      observer: 'setLayout'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lpictures: [],
    rpictures: []
  },

  ready: function() {
    
  },


  pageLifetimes: {
    show: function () {
      this.setLayout();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    _toPreview: function(e) {
      var index = e.currentTarget.dataset.index
      var id = e.currentTarget.dataset.id
      this.triggerEvent('toPreview', {id: id})      
      this.toPreview(e)
    },

    toPreview: function (e) {
      var index = e.currentTarget.dataset.index
      var id = e.currentTarget.dataset.id
      wx.navigateTo({
        url: '/pages/preview/preview?index=' + index + '&id=' + id,
      })
    },

    setLayout: function () {
      var pictures = this.properties.pictures
      var lpictures = []
      var rpictures = []
      for (var i in pictures) {
        if(i % 2 == 0) {
          lpictures.push(pictures[i])
        }else {
          rpictures.push(pictures[i])
        }
      }
      this.setData({
        lpictures: lpictures,
        rpictures: rpictures
      })
      
    },

    collect: function(e) {
      var index = e.currentTarget.dataset.index
      var key = e.currentTarget.dataset.key
      var id = e.currentTarget.dataset.id

      wx.request({
        url: Config.restUrl + '/pictures/' + id + '/collect' ,
        header: { 'token': wx.getStorageSync('token') },
        method: 'post',
        success: res => {
          if(res.data.status == 'success') {
            if (key == 'left') {
              var data_key = 'lpictures[' + index + '].collect'
            } else {
              var data_key = 'rpictures[' + index + '].collect'
            }
            this.setData({
              [data_key]: 1
            })
          }
        }
      })
    },

    uncollect: function (e) {
      var index = e.currentTarget.dataset.index
      var key = e.currentTarget.dataset.key
      var id = e.currentTarget.dataset.id
      wx.request({
        url: Config.restUrl + '/pictures/' + id + '/uncollect',
        header: { 'token': wx.getStorageSync('token') },
        method: 'post',
        success: res => {
          if (res.data.status == 'success') {
            if (key == 'left') {
              var data_key = 'lpictures[' + index + '].collect'
            } else {
              var data_key = 'rpictures[' + index + '].collect'
            }
            this.setData({
              [data_key]: 0
            })
          }
        }
      })
    },

  
      

     

   
  }
})
