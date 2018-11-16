import { Config } from "../../../utils/config.js"
import { Token } from "../../../utils/token.js"



var app = getApp()
const token = new Token

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fan_id: 0,
    social_id: 0,
    social_index: 0,
    comment_count: 0,
    comments: {},
    social: {},
    commentPanleFlag:false,
    operatePanleFlag:false,
    replyPanleFlag: false,
    replyUser: false,
    loading: true,
    key: 'social',
    notice_fans: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    var index = options.index
    var key = options.key ? options.key : 'socials'

    if (key == 'socials') {
      var social = app.globalData.socials[index]
    } else {
      var social = app.globalData.mySocials[index]
    }
  
    this.setData({
      social_id: id,
      social_index: index,
      key: key,
      social: social
    })

    

    token.verify(this.getComment)
  },

  onShow: function() {
    this.setData({
      comments: app.globalData.comments
    })
    this.setCommentCount()
  },

  onShareAppMessage: function () {
    return {
      title: 'P站星选',
    }
  },

  onReady: function () {
    this.loginPanel = this.selectComponent("#loginPanel");
    this.reportPanel = this.selectComponent("#reportPanel");    
  },

  getUid: function() {
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

  setCommentCount: function() {
    if(this.data.key == 'socials') {
      var comment_count = app.globalData.socials[this.data.social_index].comments_count
    }else {
      var comment_count = app.globalData.mySocials[this.data.social_index].comments_count
    }
    
    this.setData({
      comment_count: comment_count
    })
  },

  toReply: function(e) {
    var id = e.currentTarget.dataset.id
    var comment_index = e.currentTarget.dataset.index
    var social_id = this.data.social_id
    var social_index = this.data.social_index
    wx.navigateTo({
      url: '/pages/socials/reply/reply?id=' + id + '&social_id=' + social_id + '&social_index=' + social_index + '&comment_index=' + comment_index + '&key=' + this.data.key
    })

  },

  getComment: function() {
    var id = this.data.social_id
    wx.request({
      url: Config.restUrl + '/socials/' + id + '/comments',
      header: { 'token': wx.getStorageSync('token') },
      method: 'GET',
      success: res => {
        var comments = res.data.data
        if (comments) {
          this.setData({
            comments: comments,
            loading: false
          })
        }

        this.setCommentCount()    
        this.getUid()        

        app.globalData.comments = this.data.comments
        
      }
    })
  },

  changeFlag: function() {
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
      commentPanleFlag: !this.data.commentPanleFlag
    })
  },

  changeOperateFlag: function() {
    this.setData({
      operatePanleFlag: !this.data.operatePanleFlag
    })
  },

  changeReplyFlag: function() {
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

  showReply: function(e) {
    var index = e.currentTarget.dataset.index
    var comment = this.data.comments[index]
    this.setData({
      comment: comment,
      comment_index: index,
      replyUser:false
    })
    this.changeReplyFlag()
  },
  

  formComment: function(e) {
    var content = e.detail.value.content
    if (content == '') {
      return
    }
    var social_id = this.data.social_id
    var fan_id = this.data.fan_id
    this.changeFlag();
    
    wx.request({
      url: Config.restUrl + '/socials/' + social_id + '/comment',
      header: { 'token': wx.getStorageSync('token') },
      data: { 'fan_id': fan_id, 'content': content, pid: 0,'social_id':social_id,'to_fan_id': 0},
      method:'POST',
      success: res => {
        if(res.data.status == 'success') {
          var comments = this.data.comments 
          var comment = res.data.data
          var length = Object.keys(comments).length;
          var key = 'comments[' + length + ']'
          this.setData({
            [key]: comment,
            comment_count: parseInt(this.data.comment_count) + 1,
            text: ''
          })
          wx.showToast({
            title: '评论成功',
            icon: 'success'
          })

          this.addCommentNotice(social_id, comment.id, 0, content)
          

          //刷新评论数
          this.refershCommentCount(this.data.comment_count)
          app.globalData.comments = this.data.comments

        }
      }
    })
  },

  formReply: function(e) {
    var content = e.detail.value.content
    if(content == '') {
      return
    }
    var social_id = this.data.social_id
    var fan_id = this.data.fan_id
    var comment = this.data.comment
    var comment_index = this.data.comment_index
    this.changeReplyFlag()
    var to_fan_id = comment.fan_id
    if (!this.data.replyUser) {
      to_fan_id = 0;
    }

    wx.request({
      url: Config.restUrl + '/socials/' + social_id + '/comment',
      header: { 'token': wx.getStorageSync('token') },
      data: { 'fan_id': fan_id, 'content': content, pid: comment.id, 'social_id': social_id, 'to_fan_id': to_fan_id },
      method: 'POST',
      success: res => {
        if (res.data.status == 'success') {

          var comment = this.data.comments[comment_index]
          var replys = comment.replys
          
          var key = 'comments['+comment_index+'].replys'
          var count_key = 'comments['+comment_index+'].replys_count'

          replys.push(res.data.data)

          this.setData({
            [key]: replys,
            [count_key]: parseInt(comment.replys_count) + 1,
            comment_count: parseInt(this.data.comment_count) + 1,
            text: ''
          })

          wx.showToast({
            title: '回复成功',
            icon: 'success'
          })

          this.addCommentNotice(social_id, comment.id,comment.fan_id, content)          
          
          //刷新评论数
          this.refershCommentCount(this.data.comment_count)
          app.globalData.comments = this.data.comments


        }
      }
    })
  },


  addCommentNotice: function (social_id,comment_id,to_fan_id,content) {
      wx.request({
        url: Config.restUrl + '/socials/' + social_id + '/addCommentNotice',
        header: { 'token': wx.getStorageSync('token') },
        data: { 'to_fan_id': to_fan_id, 'module_id': social_id, 'module_comment_id': comment_id,'module': 'social', 'content': content},
        method: 'POST',
        success: res => {
          
        }
      })
    },


  operate: function(e) {
    
    var index = e.currentTarget.dataset.index
    var comment = this.data.comments[index]
    
    this.setData({
      comment: comment,
      comment_index: index
    })
    this.changeOperateFlag();
    
  },
  
  setClipboardData: function() {
    wx.setClipboardData({
      data: this.data.comment.content,
    })
    // this.changeOperateFlag();
  },

  deleteComment: function(e) {
    var id = this.data.comment.id
    var comment_index = this.data.comment_index
    wx.request({
      url: Config.restUrl + '/socials/deleteComment',
      data:{'id':id},
      header: { 'token': wx.getStorageSync('token') },
      method: 'POST',
      success: res => {
        if(res.data.status == 'success') {

          var count = res.data.count

          var comments = this.data.comments

          comments.splice(comment_index,1)

          this.setData({
            comments: comments,
            comment_count: parseInt(this.data.comment_count) - count
          })
          //刷新评论数
          this.refershCommentCount(this.data.comment_count)
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }else{
          wx.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
      }
    })
  },

  refershCommentCount: function(count) {
    //刷新评论数
    if (this.data.key == 'socials') {
      app.globalData.socials[this.data.social_index].comments_count = count
    } else {
      app.globalData.mySocials[this.data.social_index].comments_count = count
    }
  },

  //举报
  report: function() {
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
    var report_data = this.data.comment;
    console.log(report_data);
    wx.request({
      url: Config.restUrl + '/report',
      header: { 'token': wx.getStorageSync('token') },
      method: 'post',
      data: { bereported_id: report_data.fan_id, comment: report_data.id, type: 'social_comments', cause: content },
      success: res => {
        console.log(res);
        wx.showToast({
          title: '举报成功',
        })
      }
    })
  }

 

  
})