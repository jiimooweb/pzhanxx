import { Config } from "config.js"

class Token {

  verify(callback) {
    var that = this;
    var token = wx.getStorageSync('token');
    wx.request({
      url: Config.restUrl + '/wechat/token/verifyToken',
      method: 'get',
      header: { 'token': token },
      success: function (res) {
        if (res.data.isValid) {
          callback()
          that.getBlackStatus()          
        }else {
          that.getToken(callback)
        }
      }
    })
  }

  getToken(callback) {
    var _this = this
    wx.login({
      success: function(res) {
        wx.request({
          url: Config.restUrl + '/wechat/token/getToken',
          data: {'code': res.code},
          method: 'post',
          success: res => {
            var token = res.data.token
            wx.setStorageSync('token', token)
            var userInfo = wx.getStorageSync('userInfo')
            if (userInfo && wx.getStorageSync('authorize_status')) {
              _this.saveUserInfo(userInfo)
            }
            callback()
            
          }
        })
      }
    })
   
  }

  saveUserInfo(userInfo) {
    wx.setStorageSync('userInfo', userInfo)    
    wx.request({
      url: Config.restUrl + '/wechat/token/saveInfo',
      data: { 'userInfo': userInfo },
      header: { 'token': wx.getStorageSync('token') },
      method: 'post',
      success: res => {
        wx.setStorageSync('authorize_status', true)
      }
    })
  }

  getBlackStatus() {
    wx.request({
      url: Config.restUrl + '/blacklist/isban',
      header: { 'token': wx.getStorageSync('token') },
      method: 'get',
      success: res => {
        if (res.data.status == 1) {
          wx.setStorageSync('black_status', true)
        }else{
          wx.setStorageSync('black_status', false)
        }
      }
    })
  }

}


export { Token };