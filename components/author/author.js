// components/author/author.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: Array
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
    _toPics: function (e) {
      this.toPics(e)
      this.triggerEvent('toPics')
    },

    toPics: function (e) {
      var tag_id = e.currentTarget.dataset.id
      var name = e.currentTarget.dataset.name

      wx.navigateTo({
        url: '/pages/pics/pics?name=' + name + '&type=1',
      })
    }
  }
})
