import {
    Config
} from "../../../utils/config.js"
import {
    Token
} from "../../../utils/token.js"
//获取应用实例
const app = getApp()
const token = new Token

Page({

    /**
     * 页面的初始数据
     */
    data: {
        fan_id: 0,
        id: 0,
        special_id: 0,
        comment: {},
        replys: {},
        commentPanleFlag: false,
        operatePanleFlag: false,
        replyPanleFlag: false,
        replyUser: false,
        reply_index: 0,
        loading: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var id = options.id
        var special_id = options.special_id
        var comment_index = options.comment_index
        this.setData({
            id: id,
            special_id: special_id,
            comment_index: comment_index
        })
        this.getUid()
        this.getCommentAndReplys(id)
        console.log(app.globalData.special_comments[comment_index]);
    },
    onReady: function() {
        this.loginPanel = this.selectComponent("#loginPanel");
        this.reportPanel = this.selectComponent("#reportPanel");
    },

    getCommentAndReplys: function(id) {
        wx.request({
            url: Config.restUrl + '/specials/replys',
            data: {
                'id': id
            },
            header: {
                'token': wx.getStorageSync('token')
            },
            method: 'POST',
            success: res => {
                if (res.data.status == 'success') {
                    this.setData({
                        comment: res.data.comment,
                        replys: res.data.replys,
                        loading: false
                    })
                    console.log(res);
                }
            }
        })
    },

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

    operateReply: function(e) {
        var index = e.currentTarget.dataset.index
        var reply = this.data.replys[index]
        this.setData({
            operate: reply,
            replyUser: true,
            reply_index: index
        })
        this.changeOperateFlag()
    },

    changeOperateFlag: function() {
        this.setData({
            operatePanleFlag: !this.data.operatePanleFlag
        });

    },

    formReply: function(e) {
        var content = e.detail.value.content
        if (content == '') {
            return
        }
        var special_id = this.data.special_id
        var pid = this.data.id
        var fan_id = this.data.fan_id
        var reply_index = this.data.reply_index
        var to_fan_id = 0;
        if (!this.data.replyUser) {
            to_fan_id = 0;
        } else {
            to_fan_id = this.data.operate.fan_id
        }
        this.init()

        wx.request({
            url: Config.restUrl + '/specials/' + special_id + '/comment',
            data: {
                'fan_id': fan_id,
                'content': content,
                pid: pid,
                'special_id': special_id,
                'to_fan_id': to_fan_id
            },
            header: {
                'token': wx.getStorageSync('token')
            },
            method: 'POST',
            success: res => {
                if (res.data.status == 'success') {
                    var replys = this.data.replys
                    replys.unshift(res.data.data)

                    this.setData({
                        replys: replys,
                        ['comment.replys_count']: parseInt(this.data.comment.replys_count) + 1
                    })

                    wx.showToast({
                        title: '操作成功',
                        icon: 'success'
                    })

                    this.addReplyNotice(special_id, this.data.comment.fan_id, to_fan_id, content)

                    //刷新回复数
                    this.refershReplyCount(this.data.comment.replys_count)

                    this.addReply(res.data.data)
                }
            }
        })
    },
    addReplyNotice: function (special_id, comment_fan_id, to_fan_id, content) {
        wx.request({
            url: Config.restUrl + '/specials/' + special_id + '/addReplyNotice',
            header: {
                'token': wx.getStorageSync('token')
            },
            data: {
                'to_fan_id': to_fan_id,
                'module_id': special_id,
                'content': content,
                'comment_fan_id': comment_fan_id
            },
            method: 'POST',
            success: res => {
                console.log(res)
            }
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
    refershReplyCount: function(count) {
        app.globalData.special_comments[this.data.comment_index].replys_count = count
    },

    addReply: function(reply) {
        app.globalData.special_comments[this.data.comment_index].replys.unshift(reply)
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
            replyUser: false,
        })
    },

    changeOperateFlag: function() {
        this.setData({
            operatePanleFlag: !this.data.operatePanleFlag
        });

    },
    setClipboardData: function() {
        wx.setClipboardData({
            data: this.data.operate.content,
        })
        // this.changeOperateFlag();
    },
    deleteComment: function(e) {
        var id = this.data.operate.id
        var reply_index = this.data.reply_index
        wx.request({
            url: Config.restUrl + '/specials/deleteComment',
            header: {
                'token': wx.getStorageSync('token')
            },
            data: {
                'id': id
            },
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
                    // //刷新评论数
                    // var count = app.globalData.socials[this.data.social_index].comments_count - 1
                    // this.refershCommentCount(count)

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
    deleteReply: function() {
        var replys = app.globalData.special_comments[this.data.comment_index].replys
        for (var i in replys) {
            if (replys[i].id == this.data.operate.id) {
                app.globalData.special_comments[this.data.comment_index].replys.splice(i, 1)
            }
        }
    },
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
        var report_data = this.data.operate;
        console.log(report_data)
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