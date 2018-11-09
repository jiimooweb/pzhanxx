// components/pic-list/pic-list.js
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
    pictures: []
  },

  ready: function() {
  },

  pageLifetimes: {
    show: function() {
      this.setLayout();      
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    
    _toPreview: function(e) {
      this.triggerEvent('toPreview')      
      this.toPreview(e)
    },

    toPreview: function (e) {
      var index = e.currentTarget.dataset.index
      var id = e.currentTarget.dataset.id
      wx.navigateTo({
        url: '/pages/preview/preview?index=' + index + '&id=' + id,
      })
    },

    setLayout: function() {
      var pictures = this.properties.pictures
      if (pictures.length % 3 == 2) {
        pictures.push({url: "" })
        this.setData({
          pictures: pictures
        })
        this.properties.pictures = pictures
      }
    }
  }
})
