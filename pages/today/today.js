import {
    Config
} from '../../utils/config.js';

import {
    Token
} from "../../utils/token.js";

const app = getApp()
const token = new Token

var length = 0;
var record = {}; //记录选中的日期的资料
var today = {}; //记录当日的资料
var yearChoice = ''; //记录选中的年
var MDRecord = ''; //记录整月资料
var shareDate = '';
Page({
    data: {
        select: 0,
        datemore: '/icon/today/icon_moreDate.png',
        todayNoLove: '/icon/today/today_nolove_p.png',
        todayLove: '/icon/today/today_love_p.png',
        headtap: true,
        sub: 0,
        lastX: 0, //滑动开始x轴位置
        lastY: 0, //滑动开始y轴位置
        currentGesture: 0, //标识手势
        nowGesture: 0,
        showT: true,
        showY: true,
        pictures:[],
        loading: true,
    },
    onLoad: function (options) {
        var that = this;
        if (options.date){
            shareDate = options.date;
            this.data.sub = parseInt(options.index);
            token.verify(this.getDate);
        }else{
            token.verify(this.getToday);
        }
    },
    onShareAppMessage: function (options) {
        var iData = this.data
        var lData = iData.list[iData.sub]
        return {
            title: '今日推荐',
            path: "/pages/today/today?date=" + lData.date + '&index=' + iData.sub,
            imageUrl: lData.picture.url
        }
    },
    toPreview: function(e) {
        var index = e.currentTarget.dataset.sub
        var id = e.currentTarget.dataset.id
        var pindex = getCurrentPages().length - 1
        app.globalData.pictures[pindex] = this.data.pictures
        wx.navigateTo({
            url: '/pages/preview/preview?index=' + index + '&id=' + id,
        })
    },
    setPictures:function(){
        var arr = this.data.list;
        var pictures = []
        for (var i = 0; i < arr.length; i++) {
            pictures.push(arr[i].picture)
        }
        this.data.pictures = pictures;
    },
    onReady:function(){
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                var system = res.system
                var barHeight = 0;
                if (system.indexOf("iOS") != -1) {
                    barHeight = 44

                } else {
                    barHeight = 48
                }
                that.setData({
                    scrollHeight: res.windowHeight - res.statusBarHeight - barHeight ,
                    statusBarHeight: res.statusBarHeight,
                    barHeight: barHeight
                });
            }
        });  
    },
    getToday: function() {
        wx.request({
            url: Config.restUrl + '/todays/mini',
            method: 'get',
            header: {
                token: wx.getStorageSync('token')
            },
            success: res => {
                var data = res.data.data;
                var date = res.data.date;
                length = data.length;
                yearChoice = date.year;
                record.day = date.day;
                record.month = date.month;
                record.year = date.year;
                record.date = date.today;
                record.mData = '';
                today.day = date.day;
                today.month = date.month;
                today.year = date.year;
                today.date = date.today;
                today.months = date.months;
                this.setData({
                    year: date.year,
                    day: date.day,
                    month: date.monthF,
                    num: 1,
                    list: data,
                    months: date.months,
                    years: date.years,
                    loading: false,
                })
                this.setPictures();
            }
        })
    },

    getDate: function () {
        wx.request({
            url: Config.restUrl + '/todays/date',
            method: 'post',
            header: {
                token: wx.getStorageSync('token')
            },
            data:{
                date:shareDate
            },
            success: res => {
                console.log(res);
                var rnum =  parseInt(this.data.sub) +1;
                var data = res.data.data;
                var date = res.data.date;
                length = data.length;
                yearChoice = date.year;
                record.day = date.day;
                record.month = date.month;
                record.year = date.year;
                record.date = date.date;
                record.mData = '';

                today.day = date.tday;
                today.month = date.tmonth;
                today.year = date.tyear;
                today.date = date.tdata;
                today.months = date.tmonths;

                this.setData({
                    year: date.year,
                    day: date.day,
                    month: date.monthF,
                    num: rnum,
                    sub: parseInt(this.data.sub),
                    list: data,
                    months: date.months,
                    years: date.years,
                    loading: false,
                })
                this.setPictures();
            }
        })
    },

    getOther: function() {
        var that = this;
        wx.request({
            url: Config.restUrl + '/todays/other',
            method: 'post',
            header: {
                token: wx.getStorageSync('token')
            },
            data: {
                date: record.date
            },
            success: res => {
                var data = res.data.data;
                record.mData = data;
                that.setData({
                    year: record.year,
                    choice: record.month,
                    select: record.date,
                    data: data,
                })
                return data;
            }
        })
    },

    openPopup: function(event) {
        var item = event.currentTarget.dataset.show;
        if (item) {
            this.setData({
                headtap: false
            })
            if (record.mData == "") {
                this.getOther();
            } else {
                this.setData({
                    year: record.year,
                    choice: record.month,
                    select: record.date,
                    data: record.mData,
                })
            }
        } else {
            this.setData({
                headtap: true
            })
        }
    },

    handleTap: function(event) {
        var that = this;
        var item = event.currentTarget.dataset.choice;
        if (yearChoice != record.year) { //切换年代
            this.getMonth(yearChoice, item);
        } else {
            if (item != record.month) {
                this.getMonth(yearChoice, item);
            } else {
                that.setData({
                    choice: item,
                    data: record.mData,
                    showY: true,
                })
                MDRecord = this.data.data;

            }
        }
    },
    getYear: function(year) {
        var that = this;
        wx.request({
            url: Config.restUrl + '/todays/year',
            method: 'post',
            header: {
                token: wx.getStorageSync('token')
            },
            data: {
                year: year,
            },
            success: res => {
                var data = res.data.data;
                var date = res.data.date;
                MDRecord = data; //记录12月的资料
                length = date.data.length;
                that.setData({
                    choice: 12,
                    data: data,
                    showY: true,
                    day: date.day,
                    month: date.monthF,
                    num: 1,
                    list: date.data,
                    months: date.months,
                })
                this.setPictures();
            }
        })
    },
    yearTap: function(event) {
        if(today.year != 2018){
            var is = event.currentTarget.dataset.show;
            this.setData({
                choice: '',
                showY: !is,
            })
        }

    },
    getYearTap: function(event) {
        var dataset = event.currentTarget.dataset;
        var item = dataset.year;
        if (item != today.year) {
            yearChoice = item;
            this.setData({
                year: item,
                showY: true,
            })
            this.getYear(item);
        } else {
            yearChoice = today.year;
            this.setData({
                months: today.months,
                showY: true,
            })
            record.date = today.date;
            record.year = today.year;
            record.month = today.month;
            record.day = today.day;
            MDRecord = this.getOther();
        }

    },

    getMonth: function(year, month) {
        var that = this;
        wx.request({
            url: Config.restUrl + '/todays/month',
            method: 'post',
            header: {
                token: wx.getStorageSync('token')
            },
            data: {
                year: year,
                month: month
            },
            success: res => {
                var data = res.data.data;
                MDRecord = data;
                that.setData({
                    choice: month,
                    data: data,
                    showY: true,
                })
            }
        })
    },

    getArticleTap: function(event) {
        var that = this;
        var dataset = event.currentTarget.dataset;
        var item = dataset.select;
        var dataSelect = dataset.dataselect;
        length = dataSelect.length;
        record.day = dataSelect[0].day;
        record.month = dataSelect[0].month;
        record.year = dataSelect[0].year;
        record.date = dataSelect[0].date;
        record.mData = MDRecord;

        yearChoice = dataSelect[0].year;
        this.setData({
            sub:0,
            num:1,
            select: item,
            list: dataSelect,
            headtap: true,
            year: record.year,
            day: record.day,
            month: this.monthFormat(record.month),
        })
        this.setPictures();
    },

    monthFormat: function(month) {
        switch (month) {
            case 1:
                var value = 'Jan.';
                break;
            case 2:
                var value = 'Feb.';
                break;
            case 3:
                var value = 'Mar.';
                break;
            case 4:
                var value = 'Apr.';
                break;
            case 5:
                var value = 'May.';
                break;
            case 6:
                var value = 'June.';
                break;
            case 7:
                var value = 'July.';
                break;
            case 8:
                var value = 'Aug.';
                break;
            case 9:
                var value = 'Sept.';
                break;
            case 10:
                var value = 'Oct.';
                break;
            case 11:
                var value = 'Nov.';
                break;
            default:
                var value = 'Dec';

        }
        return value;
    },


    handletouchmove: function(event) {
        if (this.data.currentGesture != 0) {
            return
        }
        let currentX = event.touches[0].pageX
        let currentY = event.touches[0].pageY
        let tx = currentX - this.data.lastX
        let ty = currentY - this.data.lastY
        var that = this;
        var item = event.currentTarget.dataset.sub;
        //左右方向滑动
        if (Math.abs(tx) > Math.abs(ty)) {
            if (tx < 0) {
                //   "向左滑动"
                this.data.currentGesture = 1
                this.setData({
                    nowGesture: 1
                })
            } else if (tx > 0) {
                //   "向右滑动"
                this.data.currentGesture = 2
                this.setData({
                    nowGesture: 2
                })
            }
        }
        //上下方向滑动
        else {
            if (ty < 0) {
                // 向上滑动
                if (item < length - 1) {
                    that.setData({
                        sub: item + 1,
                        num: item + 2,
                        nowGesture: 3
                    })
                }
                this.data.currentGesture = 3
            } else if (ty > 0) {
                // 向下滑动
                if (item > 0) {
                    that.setData({
                        sub: item - 1,
                        num: item,
                        nowGesture: 4
                    })
                }
                this.data.currentGesture = 4
            }
        }
        //将当前坐标进行保存以进行下一次计算
        this.data.lastX = currentX
        this.data.lastY = currentY
    },

    handletouchtart: function(event) {
        this.data.lastX = event.touches[0].pageX
        this.data.lastY = event.touches[0].pageY
    },

    handletouchend: function(event) {
        this.data.currentGesture = 0
    },

    like: function(event) {
        var that = this;
        var dataset = event.currentTarget.dataset;
        var sub = dataset.sub;
        var list = dataset.list;
        var tid = list[sub].id;
        var isLike = list[sub].isLike;
        if (isLike > 0) {
            list[sub].isLike = 0;
            list[sub].today_likes_count = list[sub].today_likes_count - 1;
            wx.request({
                url: Config.restUrl + '/todayLikes/delete',
                method: 'post',
                header: {
                    token: wx.getStorageSync('token')
                },
                data: {
                    today_id: tid,
                },
                success: res => {
                    that.setData({
                        list: list
                    })
                    this.setPictures();
                }

            })
        } else {
            list[sub].isLike = 1;
            list[sub].today_likes_count = list[sub].today_likes_count + 1;
            wx.request({
                url: Config.restUrl + '/todayLikes',
                method: 'post',
                header: {
                    token: wx.getStorageSync('token')
                },
                data: {
                    today_id: tid,
                },
                success: res => {
                    that.setData({
                        list: list
                    })
                    this.setPictures();
                }
            })
        }
    }
})