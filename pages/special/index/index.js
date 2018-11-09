import {
    Config
} from "../../../utils/config.js"
import {
    Token
} from "../../../utils/token.js"
//获取应用实例
const app = getApp()
const token = new Token

var page = 1;
var total = 0;
var per_page = 0;
var all_page = 0;


// 请求数据
Page({
    data: {
        hidden: true,
        flag_search: true,
        list: [],
        scrollTop: 0,
        scrollHeight: 0
    },
    onLoad: function() {
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    scrollHeight: res.windowHeight
                });
            }
        });
        token.verify(this.loadFirst)
        
    },

    onReady: function () {
        this.loginPanel = this.selectComponent("#loginPanel");
    },
    onShareAppMessage: function () {
        return {
            title: '热门专辑',
            path: "/pages/special/index/index" ,
        }
    },

    //页面滑动到底部
    bindDownLoad: function() {
        var that = this;
        page = page + 1;
        if (page <= all_page) {
            this.loadMore();
        }
    },
    scroll: function(event) {
        this.setData({
            scrollTop: event.detail.scrollTop
        });
    },
    loadFirst: function() {
        var that = this;
        that.setData({
            hidden: false
        });
        wx.request({
            url: Config.restUrl + '/specials/mini?page=' + page,
            method: 'get',
            header: {
                token: wx.getStorageSync('token')
            },
            success: function(res) {
                var data = res.data.data;
                total = data.total;
                per_page = data.per_page;
                all_page = Math.ceil(total / per_page);
                that.setData({
                    hidden: true,
                    list: data.data,
                });
                console.log(data)
            }
        });
    },
    loadMore: function() {
        var that = this;
        that.setData({
            hidden: false
        });
        wx.request({
            url: Config.restUrl + '/specials/mini?page=' + page,
            method: 'get',
            header: {
                token: wx.getStorageSync('token')
            },
            success: function(res) {
                var list = that.data.list;
                var data = res.data.data;
                for (var i = 0; i < data.data.length; i++) {
                    list.push(data.data[i]);
                }
                that.setData({
                    hidden: true,
                    list: list,
                });
            }
        });
    },
    showTap: function(e) {
        var dataset = e.currentTarget.dataset;
        var sid = dataset.sid;
        var curl = dataset.curl;
        var title = dataset.title;
        wx.navigateTo({
            url: '../show/show?sid=' + sid + '&curl=' + curl + '&title=' + title,
        })
    },
    // 搜索
    showSearch: function(e) {
        wx.navigateTo({
            url: '../search/search',
        })
    },
})