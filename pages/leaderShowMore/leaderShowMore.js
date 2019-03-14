import {
    Config
} from "../../utils/config.js"
import {
    Token
} from "../../utils/token.js"

const app = getApp()
const token = new Token
var count = 10;
var data_all;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            id: options.id
        })
        token.verify(this.getDate);
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

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    getDate: function() {
        var id = this.data.id;
        wx.request({
            url: Config.restUrl + '/leaderboards/' + id + '/more',
            method: 'get',
            header: {
                token: wx.getStorageSync('token')
            },
            success: res => {
                var data = res.data.data;
                data_all = data;
                var record;
                if(data.length>count){
                    record = data.slice(0, count)
                    var all_loadFlag = true;
                } else {
                    record = data
                    var all_loadFlag = false;
                }
                
                this.setData({
                    all_time:1,
                    all_length:record.length,
                    rpictures: record
                })
            }
        })
    },
    toPreview: function(e) {
        var index = e.currentTarget.dataset.index
        var id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/preview/preview?index=' + index + '&id=' + id,
        })

    },
    scroll: function (e) {
        var scrollHeight = e.detail.scrollTop
        this.data.scroll = scrollHeight
        if (scrollHeight > 2000) {
            this.setData({
                topShow: true
            })
        } else {
            this.setData({
                topShow: false
            })
        }
    },

    toTop: function () {
        this.setData({
            anchor: 'anchor'
        })
    },
    loadNewAll:function(e){
        var time = e.currentTarget.dataset.time + 1;
        var ceil_all = Math.ceil(data_all.length / count);
        var all_loadFlag = true;
        var record;

        if (ceil_all >= time) {
            if (ceil_all > time) {
                record = data_all.slice((time - 1) * count, (time - 1) * count + count)

            } else if (ceil_all == time) {
                record = data_all.slice((time - 1) * count, data_all.length)
                all_loadFlag = false;
            }
            var all = this.data.rpictures;
            for (var i = 0; i < record.length; i++) {
                all.push(record[i]);
            }
            this.setData({
                rpictures: all,
                all_time: time,
                all_loadFlag: all_loadFlag
            })
        } else {
            this.setData({
                all_loadFlag: false
            })
        }
    }
})