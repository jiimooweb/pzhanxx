// components/tab/tab.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        tabs: Array,
        dot: Number,
        tabIndex: Number,
        year: String,
        month: String,
        day: String,
    },

    /**
     * 组件的初始数据
     */
    data: {
        height: 0,
        barHeight: 0,
        statusBarHeight: 0,
        tabs: [],
        tabIndex: 0,
        backFlag: true,
        dot: 0,
        datemore: '/icon/today/icon_moreDate.png',
    },

    ready: function () {
        this._init()

    },

    /**
     * 组件的方法列表
     */
    methods: {
        _choose: function (e) {
            var index = e.currentTarget.dataset.index
            this.setData({
                tabIndex: index
            })
            this.triggerEvent('choose', { index: index })
        },
        _change:function(e){
            this.triggerEvent('change')
        },
        _back: function (e) {
            this.back()
            this.triggerEvent('back');
        },

        getHeight: function () {
            return 'aaa';
        },

        _init: function () {
            var _this = this
            wx.getSystemInfo({
                success: function (res) {
                    var system = res.system
                    var barHeight = 0;
                    if (system.indexOf("iOS") != -1) {
                        barHeight = 44
                    } else {
                        barHeight = 48
                    }
                    var height = parseInt(barHeight) + res.statusBarHeight
                    _this.setData({
                        barHeight: barHeight,
                        statusBarHeight: res.statusBarHeight,
                        height: height
                    })
                }
            })

            if (getCurrentPages().length == 1) {
                this.setData({
                    backFlag: false
                })
            }

            // this._getHeight()
        },

        back: function () {
            wx.navigateBack({
                delta: 1
            })
        }


    },



})
