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

// 搜索弹窗
const getStorage = (key) => {
    try {
        var v = wx.getStorageSync(key);
        return v;
    } catch (e) {
        return [];
    }
}
// 搜索弹窗
const setStorage = (key, cont) => {
    wx.setStorage({
        key: key,
        data: cont
    })
}


// 请求数据
Page({
    data: {
        hidden: true,
        flag_search: false,
        flag_res: false,
        list: [],
        scrollTop: 0,
        scrollHeight: 0,
        isnull: false

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
            success: function(res) {
                var data = res.data.data;
                total = data.total;
                per_page = data.per_page;
                all_page = Math.ceil(total / per_page);
                that.setData({
                    hidden: true,
                    list: data.data,
                });
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
        wx.navigateTo({
            url: '../show/show?sid=' + sid ,
        })
    },
    showSearch: function() {
        this.setData({
            flag_search: false
        })
    },
    //消失
    hide: function() {
        this.setData({
            flag_res: false,
            searchIsHidden: true,
            inputVal: ""
        })
    },
    showlog: function() {
        var searchList_stroage = getStorage('searchList') || [];
        var searchList = []
        if (typeof(searchList_stroage) != undefined && searchList_stroage.length > 0) {
            for (var i = 0, len = searchList_stroage.length; i < len; i++) {
                searchList.push(searchList_stroage[i])
            }
        } else {
            searchList = searchList_stroage
        }
        this.setData({
            flag_res: true,
            searchIsHidden: false,
            searchAllShow: false,
            searchList: searchList.reverse(),
        })
    },
    bindGoSearch: function(event) {
        var inputVal = event.detail.value;
        if (inputVal != "") {
            let searchList_stroage = getStorage('searchList') || [];
            if (searchList_stroage.length > 8) {
                searchList_stroage.splice(0, 1)
                this.updataLog(searchList_stroage)
            }
            if (searchList_stroage.indexOf(inputVal) == -1) {
                searchList_stroage.push(inputVal)
                setStorage('searchList', searchList_stroage)
            }
            this.setData({
                inputVal: '',
                searchIsHidden: true
            })
            this.goSearch(inputVal)
        }
    },
    bindGo: function(e) {
        let inputVal = e.currentTarget.dataset.item;
        this.goSearch(inputVal)
    },
    bindDelLog: function(e) {
        let val = e.currentTarget.dataset.item;
        let searchList_stroage = getStorage('searchList') || [];
        let index = searchList_stroage.indexOf(val);
        searchList_stroage.splice(index, 1)
        this.updataLog(searchList_stroage)
    },
    updataLog: function(list) {
        setStorage('searchList', list)
        this.setData({
            searchList: list.reverse()
        })
    },
    inputChange: function(e) {
        var val = e.detail.value;
        var searchList_stroage = getStorage('searchList') || [];
        var searchList = []
        if (typeof(val) != undefined && val.length > 0 && typeof(searchList_stroage) != undefined && searchList_stroage.length > 0) {

            for (var i = 0, len = searchList_stroage.length; i < len; i++) {
                if (searchList_stroage[i].indexOf(val) != -1) {
                    searchList.push(searchList_stroage[i])
                }
            }
        } else {
            searchList = searchList_stroage
        }
        this.setData({
            inputVal: val,
            searchList: searchList.reverse(),
        })
    },
    goSearch(val) {
        var that = this;
        wx.request({
            url: Config.restUrl + '/specials/search',
            data: {
                key: val
            },
            header: {
                token: wx.getStorageSync('token')
            },
            method: 'post',
            success: function(res) {
                var data = res.data.data;
                total = data.total;
                per_page = data.per_page;
                all_page = Math.ceil(total / per_page);
                if (data.data.length == 0) {
                    var isnull = true
                } else {
                    var isnull = false
                }
                that.setData({
                    flag_res: false,
                    hidden: true,
                    list: data.data,
                    searchIsHidden: true,
                    isnull: isnull
                });
                //无资料反馈未写
            }
        })

    },
    bindSearchAllShow(that) {
        this.setData({
            searchAllShow: true
        })
    },
    bindClearSearch: function() {
        setStorage('searchList', [])
        this.setData({
            searchList: []
        })
    },
    bindSearchHidden() {
        this.setData({
            searchIsHidden: true,
            flag_res: false,
        })
    },
})