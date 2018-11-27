// components/tab/tab.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabs: Array,
    title: String,
    bgColor: String,
    block: Boolean,
    diyIcon:Boolean,
    icon: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    barHeight: 0,
    statusBarHeight: 0,
    title: '',
    tabIndex: 0,
    bgColor: "#fff",
    backFlag: true,
    block: true,
    icon: ''
  },

  ready: function () {
    this._init()

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _choose: function (e) {
      var index = e.currentTarget.dataset.index
      this.setData({
        tabIndex: index
      })
      this.triggerEvent('choose', { index: index })
    },

    _back: function(e) {
      this.back()
      this.triggerEvent('back');
    },

    _iconTap: function(e) {
      this.triggerEvent('iconTap');
    },

    _init: function () {
      var _this = this
      wx.getSystemInfo({
        success: function (res) {
          var system = res.system
          var barHeight = 0;
          if (system.indexOf("iOS") != -1) {
            barHeight = 44
          } else {
            barHeight = 48
          }

          _this.setData({
            barHeight: barHeight,
            statusBarHeight: res.statusBarHeight
          })
        }
      })
      this.setData({
        tabs: this.properties.tabs
      })
      if(getCurrentPages().length == 1) {
        this.setData({
          backFlag: false
        })
      }
    },

    back: function() {
      wx.navigateBack({
        delta: 1
      })
    }

  },



})
