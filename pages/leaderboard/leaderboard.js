import {
    Config
} from "../../utils/config.js"
import {
    Token
} from "../../utils/token.js"

const app = getApp()
const token = new Token

var arrDate; //所有日期
var arrYear = []; //所有年份
var today;
var data_all;
var data_first;
var count = 10;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: ['排行', '首次登场'],
        tabIndex: 0,
        headtap: true,
        showY: true,
        all_loadFlag: true,
        first_loadFlag:true

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        token.verify(this.getDate);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                var system = res.system
                var barHeight = 0;
                if (system.indexOf("iOS") != -1) {
                    barHeight = 44

                } else {
                    barHeight = 48
                }
                that.setData({
                    scrollHeight: res.windowHeight - res.statusBarHeight - barHeight,
                    statusBarHeight: res.statusBarHeight,
                    barHeight: barHeight
                });
            }
        });

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
        return {
            title: '每日排行',
        }
    },
    getDate: function() {
        wx.request({
            url: Config.restUrl + '/leaderDates/date',
            method: 'get',
            header: {
                token: wx.getStorageSync('token')
            },
            success: res => {
                var data = res.data.data;
                today = res.data.today;
                var length = data.length;
                for (var i = 0; i < length; i++) {
                    arrYear.push(data[i].year)
                }
                arrDate = data;
                var days = this.getDay(today.year, today.month)
                this.setData({
                    year: today.year,
                    year_list: today.year,
                    month: today.month,
                    monthF: today.monthF,
                    day: today.day,
                    choice: today.month,
                    months: data[length - 1].month,
                    days: days,
                    select: today.day
                })
                this.getData(today.year, today.month, today.day)
            }
        })
    },

    dateChange: function(event) {
        var headtap = this.data.headtap;
        this.setData({
            headtap: !headtap,
        })
    },
    yearTap: function(event) {
        if (today.year != 2018) {
            var is = event.currentTarget.dataset.show;
            this.setData({
                choice: '',
                showY: !is,
                arrYear: arrYear,
            })
        }
    },
    handleYear: function(event) {
        var item = event.currentTarget.dataset.year;
        var r_months;
        for (let i in arrDate) {
            if (item == arrDate[i].year) {
                r_months = arrDate[i].month
            }
        }
        var days = this.getDay(item, r_months[0])
        this.setData({
            year_list: item,
            months: r_months,
            choice: r_months[0],
            showY: true,
            days: days,
        })

    },
    handleMonth: function(event) {
        var that = this;
        var item = event.currentTarget.dataset.choice;
        var year = this.data.year_list;
        var days = this.getDay(year, item);
        this.setData({
            choice: item,
            days: days,
        })

    },
    handleDay: function(event) {
        var that = this;
        var item = event.currentTarget.dataset.select;
        var year = this.data.year_list;
        var month = this.data.choice;
        this.setData({
            headtap: true,
        })
        this.getData(year, month, item)
    },
    getData: function(year, month, day) {
        wx.request({
            url: Config.restUrl + '/leaderDates/data',
            method: 'post',
            header: {
                token: wx.getStorageSync('token')
            },
            data: {
                year: year,
                month: month,
                day: day,
            },
            success: res => {
                var data = res.data;
                if (data != "") {
                    var monthF = this.monthFormat(month);
                    var first = data.first
                    var arr = []
                    for (let i in first) {
                        arr.push(first[i]); //属性
                    }
                    data_all = data.data;
                    data_first = arr;
                    var record_data_all;
                    var record_data_first;
                    if (data_all.length > count) {
                        record_data_all = data_all.slice(0, count)
                        var all_loadFlag = true;
                    } else {
                        record_data_all = data_all
                        var all_loadFlag = false;
                    }
                    if (data_first.length > count) {
                        record_data_first = data_first.slice(0, count)
                        var first_loadFlag = true;
                    } else {
                        record_data_first = data_first
                        var first_loadFlag = false;
                    }
                    this.setData({
                        year: year,
                        month: month,
                        monthF: monthF,
                        day: day,
                        all: record_data_all,
                        first: record_data_first,
                        all_length: record_data_all.length,
                        first_length: record_data_first.length,
                        select: day,
                        headtap: true,
                        all_time: 1,
                        first_time:1,
                        all_loadFlag: all_loadFlag,
                        first_loadFlag: first_loadFlag
                    })
                }
            }
        })
    },
    getDay: function(year, month) {
        var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        var arr = [1, 3, 5, 7, 8, 10, 12];
        if (year == 2018) {
            var record = []
            if (year == today.year) {
                for (var i = today.day; i >= 21; i--) {
                    var d = new Date(year + "-" + month + "-" + i);
                    var obj = {
                        day: i,
                        week: weekday[d.getDay()]
                    }
                    record.push(obj);
                }
            } else {
                for (var i = 31; i >= 21; i--) {
                    var d = new Date(year + "-" + month + "-" + i);
                    var obj = {
                        day: i,
                        week: weekday[d.getDay()]
                    }
                    record.push(obj);
                }

            }

            return record;
        }
        if (year == today.year && month == today.month) {
            var record = []
            for (var i = today.day; i > 0; i--) {
                var r_month = month
                if (month < 10) {
                    r_month = '0' + r_month
                }
                if (i < 10) {
                    i = '0' + i
                }
                var d = new Date(year + "-" + r_month + "-" + i);
                var obj = {
                    day: i,
                    week: weekday[d.getDay()]
                }
                record.push(obj);
            }
            return record;
        }
        if (this.inArray(month, arr)) {
            //31
            // return [31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
            var record = []
            for (var i = 31; i > 0; i--) {
                var r_month = month
                if (month < 10) {
                    r_month = '0' + r_month
                }
                if (i < 10) {
                    i = '0' + i
                }
                var d = new Date(year + "-" + r_month + "-" + i);
                var obj = {
                    day: i,
                    week: weekday[d.getDay()]
                }
                record.push(obj);
            }
            return record;


        } else if (month == 2) {
            if (year % 400 == 0 || (year % 4 == 0 && year % 100 !== 0)) {
                //29
                var record = []
                for (var i = 29; i > 0; i--) {
                    var r_month = month
                    if (month < 10) {
                        r_month = '0' + r_month
                    }
                    if (i < 10) {
                        i = '0' + i
                    }
                    var d = new Date(year + "-" + r_month + "-" + i);
                    var obj = {
                        day: i,
                        week: weekday[d.getDay()]
                    }
                    record.push(obj);
                }
                return record;
            } else {
                //28
                var record = []
                for (var i = 28; i > 0; i--) {
                    var r_month = month
                    if (month < 10) {
                        r_month = '0' + r_month
                    }
                    if (i < 10) {
                        i = '0' + i
                    }
                    var d = new Date(year + "-" + r_month + "-" + i);
                    var obj = {
                        day: i,
                        week: weekday[d.getDay()]
                    }
                    record.push(obj);
                }
                return record;
            }
        } else {
            //30
            var record = []
            for (var i = 30; i > 0; i--) {
                var r_month = month
                if (month < 10) {
                    r_month = '0' + r_month
                }
                if (i < 10) {
                    i = '0' + i
                }
                var d = new Date(year + "-" + r_month + "-" + i);
                var obj = {
                    day: i,
                    week: weekday[d.getDay()]
                }
                record.push(obj);
            }
            return record;
        }
    },
    inArray: function(search, array) {
        for (var i in array) {
            if (array[i] == search) {
                return true;
            }
        }
        return false;
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
                var value = 'Dec.';

        }
        return value;
    },

    // swiper
    change: function(e) {
        var current = e.detail.current
        this.setData({
            tabIndex: current,
            topShow: false
        })
    },
    tabChoose: function(e) {
        var index = e.detail.index
        this.setData({
            headtap: true,
            tabIndex: index,
        })
    },
    scroll: function(e) {
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

    toTop: function() {
        this.setData({
            anchor: 'anchor'
        })
    },
    loadNewAll: function(e) {
        var time = e.currentTarget.dataset.time + 1;
        var ceil_all = Math.ceil(data_all.length / count);
        var record_data_all = [];
        var all_loadFlag = true;

        if (ceil_all >= time) {
            if (ceil_all > time) {
                record_data_all = data_all.slice((time - 1) * count, (time - 1) * count + count)

            } else if (ceil_all == time) {
                record_data_all = data_all.slice((time - 1) * count, data_all.length)
                all_loadFlag = false;
            }
            var all = this.data.all;
            for (var i = 0; i < record_data_all.length; i++) {
                all.push(record_data_all[i]);
            }
            this.setData({
                all: all,
                all_time: time,
                all_loadFlag: all_loadFlag
            })
        }else{
            this.setData({
                all_loadFlag: false
            })
        }
    },
    loadNewFirst: function(e) {
        var time = e.currentTarget.dataset.time + 1;
        var ceil_first = Math.ceil(data_first.length / count);
        var record_data_first = [];
        var first_loadFlag = true;

        if (ceil_first >= time) {
            if (ceil_first > time) {
                record_data_first = data_first.slice((time - 1) * count, (time - 1) * count + count)
            } else if (ceil_first == time) {
                record_data_first = data_first.slice((time - 1) * count, data_first.length)
                first_loadFlag = false;
            }

            var first = this.data.first;
            for (var i = 0; i < record_data_first.length; i++) {
                first.push(record_data_first[i]);
            }
            this.setData({
                first: first,
                first_time: time,
                first_loadFlag: first_loadFlag
            })
        }else{
            this.setData({
                first_loadFlag: false
            })
        }
    },

})