// components/report/report.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    contents: ['广告','色情','辱骂','骚动','反动','其他'],
    display:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _select: function(e) {
      var content = this.select(e)
      this.triggerEvent('select', { content: content })
    },

    _hide: function() {
      this.hide()
      this.triggerEvent('hide')
    },

    _show: function () {
      this.show()
      this.triggerEvent('show')
    },

    select: function(e) {
      return e.currentTarget.dataset.content
    },

    hide: function(e) {
      this.setData({
        display: false
      })
    },

    show: function (e) {
      this.setData({
        display: true
      })
    }
  }
})
