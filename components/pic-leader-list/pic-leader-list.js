import { Config } from "../../utils/config.js"

const app = getApp()

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        pictures: {
            type: Array,
            observer: 'setLayout'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        rpictures: [],
    },

    ready: function () {
        this.loginPanel = this.selectComponent("#loginPanel");
    },


    pageLifetimes: {
        show: function () {
            this.setLayout();
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {

        _toPreview: function (e) {
            var index = e.currentTarget.dataset.index
            var id = e.currentTarget.dataset.id
            this.triggerEvent('toPreview', { id: id })
            this.toPreview(e)
        },

        toPreview: function (e) {
            var index = e.currentTarget.dataset.index
            var id = e.currentTarget.dataset.id
            wx.navigateTo({
                url: '/pages/preview/preview?index=' + index + '&id=' + id,
            })
        },

        setLayout: function () {
            var pictures = this.properties.pictures
            this.setData({
                rpictures: pictures
            })
        },
    }
})
