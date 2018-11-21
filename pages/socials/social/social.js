import { Config } from "../../../utils/config.js"

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    social: {},
    social_id: 0,
    social_index: null,
    comments:[],
    fan_id: 0,
    loading: true,
    isShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    var index = options.index
    var key = options.key ? options.key : 'socials'

    this.setData({
      social_id: id,
      key: key
    })
    if (index != undefined) {
      if (this.data.key == 'socials') {
        var socials = app.globalData.socials[index]
      } else {
        var socials = app.globalData.mySocials[index]
      }
      this.setData({
        social_index: index,        
        social: socials
      })
      
      this.getComment(id)
    }else {
      this.getSocial() 
    }
    this.getUid()
   
  },
  
  onShow: function (options) {
    if (this.data.isShow) {
      this.getSocial()    
    }
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

  onHide: function() {
    this.setData({
      loading: true      
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

  getSocial: function () {
    var social_id = this.data.social_id
    wx.request({
      url: Config.restUrl + '/socials/' + social_id,
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var social = res.data.data
        if (this.data.social_index != undefined) {
          if (this.data.key == 'socials') {
            app.globalData.socials[this.data.social_index].comments_count = social.comments_count
            this.setData({
              social: app.globalData.socials[this.data.social_index]
            })
          } else {
            app.globalData.mySocials[this.data.social_index].comments_count = social.comments_count
            this.setData({
              social: app.globalData.mySocials[this.data.social_index]
            })
          }
          
        }else {
          this.setData({
            social: social
          })
        }
        

        this.getComment(social_id)

        // if (this.data.social) {
        //   this.formatSocialImg(this.data.social)
        // }
      }
    })
  },

  like: function (e) {
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    wx.request({
      url: Config.restUrl + '/socials/' + id + '/like',
      header: { 'token': wx.getStorageSync('token') },
      method: 'post',
      success: res => {
        if (res.data.status == 'success') {
          var social = this.data.social
          var like_count = social.like_fans_count
          var like_key = 'social.like'
          var like_count_key = 'social.like_fans_count'
          wx.showToast({
            title: '点赞成功',
            icon: 'success',
          })
          this.setData({
            [like_key]: 1,
            [like_count_key]: like_count + 1
          })

        }
      },
    })
  }, 

  getComment: function (social_id) {
    wx.request({
      url: Config.restUrl + '/socials/' + social_id + '/comments',
      header: { 'token': wx.getStorageSync('token') },
      method: 'GET',
      success: res => {
        var comments = res.data.data
        if (comments) {
          this.setData({
            comments: comments,
            loading: false,
            isShow: true
          })
        }

      }
    })
  },

  toReply: function (e) {
    var id = e.currentTarget.dataset.id
    var comment_index = e.currentTarget.dataset.index
    var social_id = this.data.social_id
    var social_index = this.data.social_index
    wx.navigateTo({
      url: '/pages/socials/reply/reply?id=' + id + '&social_id=' + social_id + '&social_index=' + social_index
    })

  },

  changeFlag: function () {
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }
    this.setData({
      commentPanleFlag: !this.data.commentPanleFlag
    })
  },

  changeOperateFlag: function () {
    this.setData({
      operatePanleFlag: !this.data.operatePanleFlag
    })
  },

  changeReplyFlag: function () {
    if (!wx.getStorageSync('authorize_status')) {
      this.loginPanel.show()
      return
    }
    this.setData({
      replyPanleFlag: !this.data.replyPanleFlag
    })
  },

  showReply: function (e) {
    var index = e.currentTarget.dataset.index
    var comment = this.data.comments[index]
    this.setData({
      comment: comment,
      comment_index: index,
      replyUser: false
    })
    this.changeReplyFlag()
  },


  formComment: function (e) {
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
      data: { 'fan_id': fan_id, 'content': content, pid: 0, 'social_id': social_id, 'to_fan_id': 0 },
      method: 'POST',
      success: res => {
        if (res.data.status == 'success') {
          var comments = this.data.comments
          var length = Object.keys(comments).length;
          var key = 'comments[' + length + ']'
          this.setData({
            [key]: res.data.data,
            ['social.comments_count']: parseInt(this.data.social.comments_count) + 1
          })
          wx.showToast({
            title: '评论成功',
            icon: 'success'
          })
        }
      }
    })
  },

  formReply: function (e) {
    var content = e.detail.value.content
    if (content == '') {
      return
    }
    var social_id = this.data.social_id
    var fan_id = this.data.fan_id
    var comment = this.data.comment
    var comment_index = this.data.comment_index
    this.changeReplyFlag()

    if (!this.data.replyUser) {
      comment.fan_id = 0;
    }

    wx.request({
      url: Config.restUrl + '/socials/' + social_id + '/comment',
      header: { 'token': wx.getStorageSync('token') },
      data: { 'fan_id': fan_id, 'content': content, pid: comment.id, 'social_id': social_id, 'to_fan_id': comment.fan_id },
      method: 'POST',
      success: res => {
        if (res.data.status == 'success') {

          var comment = this.data.comments[comment_index]
          var replys = comment.replys

          var key = 'comments[' + comment_index + '].replys'
          var count_key = 'comments[' + comment_index + '].replys_count'

          replys.push(res.data.data)

          this.setData({
            [key]: replys,
            [count_key]: parseInt(comment.replys_count) + 1,
            ['social.comments_count']: parseInt(this.data.social.comments_count) + 1
          })

          wx.showToast({
            title: '回复成功',
            icon: 'success'
          })
          //刷新评论数
          // this.refershCommentCount(this.data.comment_count)
          // app.globalData.comments = this.data.comments

        }
      }
    })
  },

  operate: function (e) {

    var index = e.currentTarget.dataset.index
    var comment = this.data.comments[index]

    this.setData({
      comment: comment,
      comment_index: index
    })
    this.changeOperateFlag();

  },

  setClipboardData: function () {
    wx.setClipboardData({
      data: this.data.comment.content,
    })
    // this.changeOperateFlag();
  },

  deleteComment: function (e) {
    var id = this.data.comment.id
    var comment_index = this.data.comment_index
    wx.request({
      url: Config.restUrl +  '/socials/deleteComment',
      data: { 'id': id },
      header: { 'token': wx.getStorageSync('token') },
      method: 'POST',
      success: res => {
        if (res.data.status == 'success') {
          var count = res.data.count

          var comments = this.data.comments

          comments.splice(comment_index, 1)

          this.setData({
            comments: comments,
            ['social.comments_count']: parseInt(this.data.social.comments_count) - count
          })
          //刷新评论数
          // this.refershCommentCount(this.data.comment_count)
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

  preview: function (e) {
    var id = e.currentTarget.dataset.id
    var social = this.data.social
    var urls = this.getPhotoUrls(social.photos)
    wx.previewImage({
      urls: urls,
      current: social.photos[id].url
    })
  },

  getPhotoUrls: function (photos) {
    var urls = []
    for (var i in photos) {
      urls.push(photos[i].url)
    }
    return urls
  },

  reportShow: function(e) {
    this.setData({
      report_type:e.currentTarget.dataset.type
    });
    this.reportPanel.show()
  },

  reportSelect: function(e) {
    var content = e.detail.content
    var type = this.data.report_type;
    switch (type){
      case'social_comments':
        var report_data = this.data.comment;
      break;
      case 'socials':
        var report_data = this.data.social;
      break;
    }
    wx.request({
      url: Config.restUrl +'/report',
      header: { 'token': wx.getStorageSync('token') },
      method :'post',
      data: { bereported_id: report_data.fan_id, comment: report_data.id, type: type, cause: content},
      success: res =>{
          wx.showToast({
            title: '举报成功',
          })
      }
    })
  },

  delSocial: function(e) {
    var id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除',
      content: '确定要删除吗?',
      success: res => {
        if (res.confirm) {
          wx.request({
            url: Config.restUrl + '/socials/' + id,
            header: { 'token': wx.getStorageSync('token') },
            method: 'DELETE',
            success: res => {
              if (res.data.status == 'success') {
                if (this.data.key == 'socials') {
                  app.globalData.socials.splice(this.data.social_index, 1)
                } else {
                  app.globalData.mySocials.splice(this.data.social_index, 1)
                }
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        } else if (res.cancel) {
          return
        }
        
      }
    })
        
  }



})