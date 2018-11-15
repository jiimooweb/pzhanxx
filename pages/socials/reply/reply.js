import { Config } from "../../../utils/config.js"

var app = getApp()
Page({
  data: {
    fan_id:0,
    id: 0,
    social_id: 0,
    comment: {},
    replys: {},
    commentPanleFlag: false,
    operatePanleFlag: false,
    replyPanleFlag: false,
    replyUser: false,
    reply_index: 0,
    loading: true
  },

  onLoad: function(options) {
    var id = options.id
    var social_id = options.social_id
    var social_index = options.social_index
    var comment_index = options.comment_index
    var key = options.key ? options.key : 'socials'
    this.setData({
      id: id,
      social_id: social_id,
      social_index: social_index,
      comment_index: comment_index,
      key: key
    })
    this.getUid()
    this.getCommentAndReplys(id)
  },

  onReady: function () {
    this.loginPanel = this.selectComponent("#loginPanel");
    this.reportPanel = this.selectComponent("#reportPanel");
    
  },

  onShareAppMessage: function () {
    return {
      title: 'P站星选',
    }
  },

  getCommentAndReplys: function(id) {
    wx.request({
      url: Config.restUrl + '/socials/replys',
      data: {'id': id},
      header: { 'token': wx.getStorageSync('token') },
      method:'POST',
      success: res => {
        if(res.data.status == 'success') {
          this.setData({
            comment: res.data.comment,
            replys: res.data.replys,
            loading: false
          })
        }
      }
    })
  },

  changeFlag: function () {
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }

    if (wx.getStorageSync('black_status')) {
      wx.showToast({
        title: '你已被禁言',
        icon: 'none'
      })
      return
    }

    this.setData({
      commentPanleFlag: !this.data.commentPanleFlag,
      replyUser: false,
    })
  },

  changeOperateFlag: function () {
    this.setData({
      operatePanleFlag: !this.data.operatePanleFlag
    });
    
  },

  changeReplyFlag: function () {
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }
    
    if (wx.getStorageSync('black_status')) {
      wx.showToast({
        title: '你已被禁言',
        icon: 'none'
      })
      return
    }

    this.setData({
      replyPanleFlag: !this.data.replyPanleFlag
    })
  },

  operate: function (e) {
    var index = e.currentTarget.dataset.index
    this.setData({
      operate: this.data.comment,
      replyUser: false,
      reply_index: 0      
    })
    this.changeOperateFlag();
  },

  operateReply: function (e) {
    var index = e.currentTarget.dataset.index
    var reply = this.data.replys[index]
    this.setData({
      operate: reply,
      replyUser: true,
      reply_index: index
    })
    this.changeOperateFlag()
  },



  formReply: function (e) {
    var content = e.detail.value.content
    if (content == '') {
      return
    }
    var social_id = this.data.social_id
    var pid = this.data.id
    var fan_id = this.data.fan_id
    var reply_index = this.data.reply_index
    var to_fan_id = 0;
    if (!this.data.replyUser) {
      to_fan_id = 0;
    }else {
      to_fan_id = this.data.operate.fan_id
    }
    this.init()
    
    wx.request({
      url: Config.restUrl + '/socials/' + social_id + '/comment',
      data: { 'fan_id': fan_id, 'content': content, pid: pid, 'social_id': social_id, 'to_fan_id': to_fan_id },
      header: { 'token': wx.getStorageSync('token') },
      method: 'POST',
      success: res => {
        if (res.data.status == 'success') {
          var replys = this.data.replys
          replys.unshift(res.data.data)

          this.setData({
            replys: replys,
            ['comment.replys_count']: parseInt(this.data.comment.replys_count) + 1,
            text: ''
          })

          wx.showToast({
            title: '操作成功',
            icon: 'success'
          })
          
          this.addReplyNotice(social_id, this.data.comment.fan_id, to_fan_id, content)
          //刷新评论数
          if (this.data.key == 'socials') {
            var count = app.globalData.socials[this.data.social_index].comments_count + 1
          } else {
            var count = app.globalData.mySocials[this.data.social_index].comments_count + 1
          }

          this.refershCommentCount(count)

          //刷新回复数
          this.refershReplyCount(this.data.comment.replys_count)
          
          this.addReply(res.data.data)
        }
      }
    })
  },

  addReplyNotice: function (social_id, comment_fan_id,to_fan_id, content) {
    wx.request({
      url: Config.restUrl + '/socials/' + social_id + '/addReplyNotice',
      header: { 'token': wx.getStorageSync('token') },
      data: { 'to_fan_id': to_fan_id, 'module_id': social_id, 'content': content, 'comment_fan_id': comment_fan_id},
      method: 'POST',
      success: res => {

      }
    })
  },

  getUid: function () {
    wx.request({
      url: Config.restUrl + '/getUid',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        this.setData({
          fan_id: res.data.uid
        })
      },
    })
  },

  init: function() {
    this.setData({
      operatePanleFlag: false,
      replyPanleFlag: false,
      commentPanleFlag: false,
      operate: {},
      replyUser: false,
      reply_index: 0
    })
  },

  setClipboardData: function () {
    wx.setClipboardData({
      data: this.data.operate.content,
    })
    // this.changeOperateFlag();
  },

  deleteComment: function (e) {
    var id = this.data.operate.id
    var reply_index = this.data.reply_index
    wx.request({
      url: Config.restUrl + '/socials/deleteComment',
      header: { 'token': wx.getStorageSync('token') },
      data: { 'id': id },
      method: 'POST',
      success: res => {
        if (res.data.status == 'success') {
          var count = res.data.count

          var replys = this.data.replys

          replys.splice(reply_index, 1)

          this.setData({
            replys: replys,
            ['comment.replys_count']: parseInt(this.data.comment.replys_count) - count
          })
          //刷新评论数
          if (this.data.key == 'socials') {
            var count = app.globalData.socials[this.data.social_index].comments_count - 1
          } else {
            var count = app.globalData.mySocials[this.data.social_index].comments_count - 1
          }
          this.refershCommentCount(count)
          
          //刷新回复数
          this.refershReplyCount(this.data.comment.replys_count)

          this.deleteReply()
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
      }
    })
  },

  refershCommentCount: function (count) {
    //刷新评论数

    if (this.data.key == 'socials') {
      app.globalData.socials[this.data.social_index].comments_count = count
    } else {
      app.globalData.mySocials[this.data.social_index].comments_count = count
    }
  },

  refershReplyCount: function (count) {
    app.globalData.comments[this.data.comment_index].replys_count = count
  },

  addReply: function(reply) {
    app.globalData.comments[this.data.comment_index].replys.unshift(reply)

  },

  deleteReply: function() {
    var replys = app.globalData.comments[this.data.comment_index].replys
    for(var i in replys) {
      if(replys[i].id == this.data.operate.id) {
        app.globalData.comments[this.data.comment_index].replys.splice(i, 1)
      }
    }
  },

  //举报
  report: function () {
    wx.showToast({
      title: '举报成功',
      icon: 'error'
    })
  },

  reportShow: function () {
    this.reportPanel.show()
  },

  reportSelect: function (e) {
    var content = e.detail.content;
    var report_data = this.data.operate;
    wx.request({
      url: Config.restUrl + '/report',
      header: { 'token': wx.getStorageSync('token') },
      method: 'post',
      data: { bereported_id: report_data.fan_id, comment: report_data.id, type: 'social_comments', cause: content },
      success: res => {
        wx.showToast({
          title: '举报成功',
        })
      }
    })
  }
  




});