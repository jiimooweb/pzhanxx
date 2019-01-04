import { Token } from "../../utils/token.js"
var token = new Token
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    display: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    display: false,
    userInfo: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _hide: function() {
      this.hide()
      this.triggerEvent('hide', {userInfo: this.data.userInfo})
    },

    _show: function () {
      this.show()
      this.triggerEvent('show')
    },

    hide: function () {
      this.setData({
        display: false
      })
    },

    show: function () {
      this.setData({
        display: true
      })
    },

    getUserInfo: function (e) {
      if (e.detail.errMsg == "getUserInfo:ok") {
        token.saveUserInfo(e.detail)
        wx.setStorageSync('authorize_status',true)
        this.setData({
          userInfo: e.detail.userInfo
        })
        this._hide()
      } else {
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        })
      }

    },

  },

  

  

 
  
})
