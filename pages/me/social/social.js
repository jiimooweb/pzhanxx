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
    data: {
        socials: [],
        loading: true,
        loadMore: false,
        isShow: false,
        isLoadMode: true,
        tipFlag: false,
        scrollHeight: 0,
        page: 1,
    },


    onLoad: function() {
        token.verify(this.getSocials)
        this.getSystemInfo()
    },

    onShow: function() {
        if (app.globalData.mySocials.length > 0 && this.data.isShow) {
            this.setData({
                socials: app.globalData.mySocials,
                isLoadMore: app.globalData.mySocialIsLoadMode
            })
        }
    },


    onReady: function() {
        this.loginPanel = this.selectComponent("#loginPanel");
    },

    onShareAppMessage: function() {
        return {
            title: 'P站星选',
        }
    },

    getSocials: function(page) {
        if (page === undefined) {
            page = this.data.page
        } else {
            page = page
        }
        wx.request({
            url: Config.restUrl + '/socials/list',
            data: {
                page: page
            },
            header: {
                'token': wx.getStorageSync('token')
            },
            success: res => {
                var socials = res.data.data.data
                var o_socials = this.data.socials
                if (socials.length > 0) {
                    var new_socoals = o_socials.concat(socials)
                    this.setData({
                        socials: new_socoals,
                        isLoadMode: true,
                        page: page + 1,
                        isShow: true
                    });
                    app.globalData.mySocials = new_socoals

                }
                this.setData({
                    loading: false,
                })

                if (new_socoals.length === res.data.data.total) {
                    this.setData({
                        isLoadMode: false,
                        loadMore: false,
                        tipFlag: true,
                    })
                    app.globalData.mySocialIsLoadMode = false
                    return
                }

            }
        })
    },

    like: function(e) {
        var id = e.currentTarget.dataset.id
        var index = e.currentTarget.dataset.index
        wx.request({
            url: Config.restUrl + '/socials/' + id + '/like',
            header: {
                'token': wx.getStorageSync('token')
            },
            method: 'post',
            success: res => {
                if (res.data.status == 'success') {
                    var socials = this.data.socials
                    var like_count = socials[index].like_fans_count
                    var like_key = 'socials[' + index + '].like'
                    var like_count_key = 'socials[' + index + '].like_fans_count'
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

    toComment: function(e) {
        var id = e.currentTarget.dataset.id
        var index = e.currentTarget.dataset.index
        var count = this.data.socials[index].comments_count
        wx.navigateTo({
            url: '/pages/socials/comment/comment?index=' + index + '&id=' + id + '&count=' + count + "&key=mySocials",
        })
    },

    preview: function(e) {
        var id = e.currentTarget.dataset.id
        var index = e.currentTarget.dataset.index
        var socials = this.data.socials
        var urls = this.getPhotoUrls(socials[index].photos)
        wx.previewImage({
            urls: urls,
            current: socials[index].photos[id].url
        })
    },

    getPhotoUrls: function(photos) {
        var urls = []
        for (var i in photos) {
            urls.push(photos[i].url)
        }
        return urls
    },

    toRelease: function() {
        if (!wx.getStorageSync('authorize_status')) {
            this.loginPanel.show()
            return
        }
        wx.navigateTo({
            url: '/pages/socials/release/release',
        })
    },

    toSocial: function(e) {
        var id = e.currentTarget.dataset.id
        var index = e.currentTarget.dataset.index

        wx.navigateTo({
            url: '/pages/socials/social/social?id=' + id + '&index=' + index + '&key=mySocials',
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

    lower: function(e) {
        if (this.data.isLoadMode) {
            this.setData({
                loadMore: true,
                isLoadMode: false,
            })

            this.getSocials()
        }
    },



})