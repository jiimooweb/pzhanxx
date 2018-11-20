import {
    Config
} from "../../../utils/config.js"
import {
    Token
} from "../../../utils/token.js"
//获取应用实例
const app = getApp()
const token = new Token

var sid = 0;

Page({
    data: {
        showL: false,
        //   评论
        fan_id: 0,
        special_id: 0,
        special_index: 0,
        comment_count: 0,
        comments: {},
        commentPanleFlag: false,
        operatePanleFlag: false,
        replyPanleFlag: false,
        replyUser: false,
        loading: true,
        notice_fans: [],
        textValue: ''
    },

    onLoad: function(options) {
        this.setData({
            cover_url: options.curl,
            title: options.title,
            special_id: options.sid
        })
        token.verify(this.getRes)
    },

    onShow: function() {
        this.setData({
            comments: app.globalData.special_comments
        })
        this.setCommentCount()
        if(this.data.id > 0){
          token.verify(this.getPicture)
        }
    },

  toPreview: function(e) {
    this.data.id = e.detail.id    
  },

  getPicture: function () {
    var id = this.data.id
    wx.request({
      url: Config.restUrl + '/pictures/' + id,
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var picture = res.data.data

        var pictures = this.data.imgs
        for (var i in pictures) {
          if (pictures[i].id == id) {
            var key = 'imgs[' + i + ']'
            this.setData({
              [key]: picture
            })
            break;
          }
        }

      }
    })
  },

    onReady: function() {
        this.loginPanel = this.selectComponent("#loginPanel");
        this.reportPanel = this.selectComponent("#reportPanel");
    },
    onShareAppMessage: function() {
        return {
            title: this.data.title,
            path: '/pages/special/show/show?sid=' + this.data.special_id + '&curl=' + this.data.cover_url + '& title=' + this.data.title,
            imageUrl: this.data.cover_url
        }
    },
    setCommentCount: function() {
        var comment_count = app.globalData.special_comments.length;
        this.setData({
            comment_count: comment_count
        })
    },

    getRes: function() {
        var id = this.data.special_id;
        wx.request({
            url: Config.restUrl + '/specials/res',
            method: 'post',
            header: {
                token: wx.getStorageSync('token')
            },
            data: {
                id: id
            },
            success: res => {
                var rData = res.data.data;
                var data = rData[0];
                sid = data.id;
                this.setData({
                    showL: true,
                    title: data.title,
                    text: data.text,
                    imgs: data.imgs,
                })
                var pindex = getCurrentPages().length - 1
                app.globalData.pictures[pindex] = data.imgs

                this.getUid();
                this.getComment(sid);
            }
        })
    },

    //   评论
    getUid: function() {
        wx.request({
            url: Config.restUrl + '/getUid',
            header: {
                'token': wx.getStorageSync('token')
            },
            success: res => {
                this.setData({
                    fan_id: res.data.uid
                })
            },
        })
    },

    getComment: function(id) {
        wx.request({
            url: Config.restUrl + '/specials/' + id + '/comments',
            header: {
                'token': wx.getStorageSync('token')
            },
            method: 'GET',
            success: res => {
                var comments = res.data.data;
                var cLength = comments.length;
                this.setData({
                    comments: comments,
                    comment_count: cLength,
                    loading: false
                })
                app.globalData.special_comments = this.data.comments
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
    changeOperateFlag: function() {
        this.setData({
            operatePanleFlag: !this.data.operatePanleFlag
        })
    },
    showReply: function(e) {
        var index = e.currentTarget.dataset.index
        var comment = this.data.comments[index]
        this.setData({
            comment: comment,
            comment_index: index,
            replyUser: false
        })
        this.changeReplyFlag()
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
    toReply: function(e) {
        var id = e.currentTarget.dataset.id
        var comment_index = e.currentTarget.dataset.index
        var special_id = this.data.special_id
        wx.navigateTo({
            url: '/pages/special/reply/reply?id=' + id + '&special_id=' + special_id + '&comment_index=' + comment_index
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
            commentPanleFlag: !this.data.commentPanleFlag,
        })
    },

    formComment: function(e) {
        var content = e.detail.value.content
        if (content == '') {
            return
        }
        var special_id = this.data.special_id
        var fan_id = this.data.fan_id
        this.changeFlag();

        wx.request({
            url: Config.restUrl + '/specials/' + special_id + '/comment',
            header: {
                'token': wx.getStorageSync('token')
            },
            data: {
                'fan_id': fan_id,
                'content': content,
                pid: 0,
                'special_id': special_id,
                'to_fan_id': 0
            },
            method: 'POST',
            success: res => {
                if (res.data.status == 'success') {
                    var comments = this.data.comments
                    var length = Object.keys(comments).length;
                    var key = 'comments[' + length + ']'
                    this.setData({
                        [key]: res.data.data,
                        comment_count: parseInt(this.data.comment_count) + 1,
                        textValue: ''
                    })
                    wx.showToast({
                        title: '评论成功',
                        icon: 'success'
                    })

                    app.globalData.special_comments = this.data.comments
                }
            }
        })
    },
    formReply: function(e) {
        var content = e.detail.value.content
        if (content == '') {
            return
        }
        var special_id = this.data.special_id
        var fan_id = this.data.fan_id
        var comment = this.data.comment
        var comment_index = this.data.comment_index
        this.changeReplyFlag()
        var to_fan_id = comment.fan_id
        if (!this.data.replyUser) {
            to_fan_id = 0;
        }

        wx.request({
            url: Config.restUrl + '/specials/' + special_id + '/comment',
            header: {
                'token': wx.getStorageSync('token')
            },
            data: {
                'fan_id': fan_id,
                'content': content,
                'pid': comment.id,
                'special_id': special_id,
                'to_fan_id': to_fan_id
            },
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
                        comment_count: parseInt(this.data.comment_count) + 1,
                        textValue: ''
                    })
                    wx.showToast({
                        title: '回复成功',
                        icon: 'success'
                    })
                  this.addCommentNotice(special_id, comment.id,comment.fan_id, content)
                    app.globalData.special_comments = this.data.comments
                }
            }
        })
    },
  addCommentNotice: function (special_id, comment_id,to_fan_id, content) {
        wx.request({
            url: Config.restUrl + '/specials/' + special_id + '/addCommentNotice',
            header: {
                'token': wx.getStorageSync('token')
            },
            data: {
                'to_fan_id': to_fan_id,
                'module_id': special_id,
                'module_comment_id': comment_id,
                'module': 'special',
                'content': content
            },
            method: 'POST',
            success: res => {

            }
        })
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
            url: Config.restUrl + '/specials/deleteComment',
            data: {
                'id': id
            },
            header: {
                'token': wx.getStorageSync('token')
            },
            method: 'POST',
            success: res => {
                if (res.data.status == 'success') {
                    var count = res.data.count

                    var comments = this.data.comments

                    comments.splice(comment_index, 1)

                    this.setData({
                        comments: comments,
                        comment_count: parseInt(this.data.comment_count) - count
                    })
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

    //举报
    report: function() {
        wx.showToast({
            title: '举报成功',
            icon: 'error'
        })
    },
    reportShow: function() {
        this.reportPanel.show()
    },
    reportSelect: function(e) {
        var content = e.detail.content;
        var report_data = this.data.comment;
        wx.request({
            url: Config.restUrl + '/report',
            header: {
                'token': wx.getStorageSync('token')
            },
            method: 'post',
            data: {
                bereported_id: report_data.fan_id,
                comment: report_data.id,
                type: 'special_comments',
                cause: content
            },
            success: res => {
                wx.showToast({
                    title: '举报成功',
                })
            }
        })
    }
})