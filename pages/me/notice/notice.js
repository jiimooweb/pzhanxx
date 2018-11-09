import {
    Config
} from "../../../utils/config.js"

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabIndex: 0,
        tarHeight: 0,
        tabs: ['点赞', '评论'],
        dot: 0,
        comment: {
            'notices': [],
            'loadMore': false,
            'isLoadMore': false,
            'page': 1,
            'tipFlag': false
        },
        like: {
            'notices': [],
            'loadMore': false,
            'isLoadMore': false,
            'page': 1,
            'tipFlag': false
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            dot: options.comment_count
        })
        this.getLikeNotices()
        this.getCommentNotices();
        this.getSystemInfo();

    },

    init: function(index) {
        if (index == 0) {
            this.getLikeNotices()
        } else {
            this.getCommentNotices()
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    onShareAppMessage: function() {
        return {
            title: 'P站星选',
        }
    },

    change: function(e) {
        var current = e.detail.current
        this.setData({
            tabIndex: current
        })

        if (current > 0) {
            this.setData({
                dot: 0
            })
        }
    },

    getCommentNotices: function() {
        var page = this.data.comment.page
        wx.request({
            url: Config.restUrl + '/notices/comment',
            data: {
                page: page
            },
            header: {
                'token': wx.getStorageSync('token')
            },
            success: res => {
                if (res.data.status == 'success') {
                    var commentNotices = res.data.data.data
                    var oCommentNotices = this.data.comment.notices
                    var newCommentNotices = [];
                    if (commentNotices.length > 0) {
                        newCommentNotices = oCommentNotices.concat(commentNotices)

                        this.setData({
                            ['comment.notices']: newCommentNotices,
                            ['comment.isLoadMore']: true,
                            ['comment.page']: page + 1
                        });

                    }

                    if (newCommentNotices.length === res.data.data.total) {
                        this.setData({
                            ['comment.isLoadMore']: false,
                            ['comment.loadMore']: false,
                            ['comment.tipFlag']: true,
                        })

                        return
                    }
                }
            }
        })
    },

    getLikeNotices: function() {
        var page = this.data.like.page
        wx.request({
            url: Config.restUrl + '/notices/like',
            data: {
                page: page
            },
            header: {
                'token': wx.getStorageSync('token')
            },
            success: res => {
                if (res.data.status == 'success') {
                    var likeNotices = res.data.data.data
                    var oLikeNotices = this.data.like.notices
                    var newLikeNotices = [];
                    if (likeNotices.length > 0) {
                        newLikeNotices = oLikeNotices.concat(likeNotices)
                        this.setData({
                            ['like.notices']: newLikeNotices,
                            ['like.isLoadMore']: true,
                            ['like.page']: page + 1
                        });

                    }

                    if (newLikeNotices.length === res.data.data.total) {
                        this.setData({
                            ['like.isLoadMore']: false,
                            ['like.loadMore']: false,
                            ['like.tipFlag']: true,
                        })

                        return
                    }
                }
            }
        })
    },

    getSystemInfo: function() {
        var _this = this
        wx.getSystemInfo({
            success: function(res) {
                _this.setScrollHeight(res.windowHeight)
            }
        })
    },

    setScrollHeight: function(height) {
        this.setData({
            scrollHeight: height
        })
    },

    toSocial: function(e) {
        var id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/socials/social/social?id=' + id,
        })
    },

    tabChoose: function(e) {
        var index = e.detail.index
        if (index > 0) {
            this.setData({
                dot: 0
            })
        }
        this.setData({
            tabIndex: index
        })
    },

    likeLoadMore: function(e) {
        if (this.data.like.isLoadMore) {
            this.setData({
                ['like.loadMore']: true,
                ['like.isLoadMore']: false,
            })
            this.getLikeNotices()

        }
    },

    commentLoadMore: function(e) {
        if (this.data.comment.isLoadMore) {
            this.setData({
                ['comment.loadMore']: true,
                ['comment.isLoadMore']: false,
            })
            this.getCommentNotices()
        }
    },

    getBarHeight: function(e) {
        var barHeight = e.detail.hieght


    }
})