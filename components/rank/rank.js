// components/rank/rank.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hotPictures: Array,
    hotIndex: Number
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _toPreview: function (e) {
      var id = e.currentTarget.dataset.id
      this.triggerEvent('toPreview', { id: id })
      this.toPreview(e)
    },

    toPreview: function (e) {
      var index = e.currentTarget.dataset.index
      var id = e.currentTarget.dataset.id
      wx.navigateTo({
        url: '/pages/preview/preview?index=' + index + '&id=' + id,
      })
    }
  }
})
