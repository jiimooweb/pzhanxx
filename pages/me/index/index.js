import { Config } from "../../../utils/config.js"
import { Token } from "../../../utils/token.js"

const token = new Token
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    authorize_status: false,
    bgImages: [
      'http://download.rdoorweb.com/pzhan/bg/shuijiao.jpg', 'http://download.rdoorweb.com/pzhan/bg/%E5%90%90%E5%8F%B8.jpg',
      'http://download.rdoorweb.com/pzhan/bg/%E7%83%AD%E7%8B%97.jpg',
      'http://download.rdoorweb.com/pzhan/bg/%E6%B0%B4%E6%9E%9C.jpg',
      'http://download.rdoorweb.com/pzhan/bg/%E5%8D%88%E9%A4%90.jpg',
      'http://download.rdoorweb.com/pzhan/bg/%E5%92%96%E5%95%A1.jpg',
      'http://download.rdoorweb.com/pzhan/bg/%E6%8A%B9%E8%8C%B6.jpg',
      'http://download.rdoorweb.com/pzhan/bg/gali.jpg',
      'http://download.rdoorweb.com/pzhan/bg/%E8%9B%8B%E7%B3%95.jpg'

    ],
    id: 0,
    notice_count: 0,
    point: 0,
    signPanelFlag: false,
    signButtonFlag: true,
    loading: false,
    continuity_day: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init()
  },

  onShow: function () {
    this.getNotices()
    this.getPointAndShareCount()
    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
      authorize_status: wx.getStorageSync('authorize_status')
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.loginPanel = this.selectComponent("#loginPanel");
  },

  init: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.getBgIdByTime()
    token.verify(this.getSign)
  },


  toSocial: function () {
    app.globalData.gsocials = this.data.socials
    wx.navigateTo({
      url: '/pages/me/social/social'
    })
    
  },

  toShare: function () {
    wx.navigateTo({
      url: '/pages/me/share-activity/share-activity'
    })
  },

  onShareAppMessage: function () {
    return {
      title: 'P站星选',
    }
  },

  changeBgId: function () {
    var id = this.data.id + 1
    if (id > 8) {
      id = 0
    }
    this.setData({
      id: id
    })
  },

  getNotices: function () {
    var page = this.data.page
    wx.request({
      url: Config.restUrl + '/notices',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        if (res.data.status == 'success') {
          this.setData({
            notice_count: res.data.count,
            like_count: res.data.like_count,
            comment_count: res.data.comment_count,
          })
        }
      }
    })
  },

  getPointAndShareCount: function () {
    wx.request({
      url: Config.restUrl + '/fan/point-and-share-count',
      header: {
        'token': wx.getStorageSync('token')
      },
      success: res => {
        this.setData({
          point: res.data.point,
          share_count: res.data.share_count
        })
      }
    })
  },



  getBgIdByTime: function () {
    wx.request({
      url: Config.restUrl + '/getBgIdByTime',
      success: res => {
        this.setData({
          id: res.data
        })
      },
    })
  },

  toNotice: function () {
    wx.navigateTo({
      url: '/pages/me/notice/notice?comment_count=' + this.data.comment_count
    })
  },

  hideSignPanel: function () {
    this.setData({
      signPanelFlag: false
    })
  },

  login: function () {
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }
  },

  showSignPanel: function () {
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }
    wx.showLoading({
      title: '正在签到',
      mask: true
    })
    wx.request({
      url: Config.restUrl + '/sign_in',
      data: {},
      header: { 'token': wx.getStorageSync('token') },
      method: 'post',
      success: res => {
        let data = res.data.data;
        this.setData({
          continuity_day: data.new_sign.continuity_day,
          addpoint: res.data.data.add_point,
          point: data.new_sign.fan.point,
          signButtonFlag: false,
          signPanelFlag: true
        });
        wx.hideLoading();
      }
    })
    this.setData({
      signPanelFlag: true
    })
  },

  getSign: function () {
    wx.request({
      url: Config.restUrl + '/get_sign',
      data: {},
      header: { 'token': wx.getStorageSync('token') },
      method: 'get',
      success: res => {
        let data = res.data.data;
        if (data) {
          let data = res.data.data;
          this.setData({
            point: data.fan.point,
            signButtonFlag: data.signButtonFlag,
            loading: true,
          });
        } else {
          this.setData({
            signButtonFlag: true,
            loading: true,
          });
        }
        this.getNotices()

        wx.hideLoading();
      }
    })
  },

  loginHide: function (e) {
    if (e.detail.userInfo != null) {
      this.setData({
        userInfo: e.detail.userInfo,
        authorize_status: true
      })
    }
  },

  toCollect: function () {
    wx.navigateTo({
      url: '/pages/me/collect/collect',
    })
  },

  toDownload: function () {
    wx.navigateTo({
      url: '/pages/me/download/download',
    })
  },

  toStatement: function () {
    wx.showModal({
      title: '声明',
      showCancel: 'false',
      content: '本小程序所有图片均来自互联网收集而来，版权归原创者所有，如果侵犯了你的权益，请通知我们（rd@rdoorweb.com），我们会及时删除侵权内容，谢谢！',
      success: function (res) {
      }
    })
  },

  toRule: function () {
    wx.navigateTo({
      url: '/pages/rule/rule',
    })
  }



})