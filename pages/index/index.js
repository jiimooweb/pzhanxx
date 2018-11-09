import { Config } from "../../utils/config.js"
import { Token } from "../../utils/token.js"

const token = new Token
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swipers:[],
    tags: [],
    specials: [],
    pictures:[],
    random_picture_ids: [],
    title: 'P站星选',
    page: 1,
    isLoadMode: true,
    topShow: false,
    anchor: '',
    carouselIndex:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    token.verify(this.getSwipers)
    this.getElementHeight()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.swipers.length > 0) {
      this.getTags();      
    }
  },

  onSlideChangeEnd:function(e){
      var that = this;
      that.setData({
          carouselIndex: e.detail.current 
      })
  },

  getSwipers: function() {
   
    wx.request({
      url: Config.restUrl + '/swiper_groups/display',
      header: { 'token': wx.getStorageSync('token') },
      method: 'get',
      success: res => {
        var swpiers = res.data.data.swipers
        this.setData({
          swpiers: swpiers
        })
        this.getTags()
        this.getSpecials()
        this.getPictures()
      }
    })
  },

  getTags: function() {
    wx.request({
      url: Config.restUrl + '/tags/random',
      header: { 'token': wx.getStorageSync('token') },
      method: 'get',
      success: res => {
        var tags = res.data.data
        this.setData({
          tags: tags
        })
      }
    })
  },

  getSpecials: function() {
    wx.request({
      url: Config.restUrl + '/specials/hot',
      header: { 'token': wx.getStorageSync('token') },
      success: res => {
        var specials = res.data.data
        this.setData({
          specials: specials
        })
      }
    })
  },

  getPictures: function () {
    var random_picture_ids = this.data.random_picture_ids
    wx.request({
      url: Config.restUrl + '/pictures/random',
      header: { 'token': wx.getStorageSync('token') },
      data: { random_picture_ids: random_picture_ids},
      method:'post',
      success: res => {
        var pictures = res.data.data
        var oPictures = this.data.pictures
        var newPictures = [];
        if (pictures.length > 0) {
          newPictures = oPictures.concat(pictures)
          this.setData({
            pictures: newPictures,
            random_picture_ids: res.data.random_picture_ids,
            isLoadMode: true
          });
        } 
        if (newPictures.length >= 500 || pictures.length == 0) {
          this.setData({
            isLoadMode: false,
            page: 1
          });
        }
      }
    })
  },

  getElementHeight: function () {
    var that = this;
    var query = wx.createSelectorQuery();
    //选择id
    query.select('#outside').boundingClientRect()
    query.exec(function (res) {
      that.setData({
        outsideHeight: res[0].height,
      })
    })
  },

  scroll: function(e) {
    var scrollHeight = e.detail.scrollTop
    if(scrollHeight > this.data.outsideHeight) {
      this.setData({
        title: '推荐图片'
      })
    } else {
      this.setData({
        title: 'P站星选'
      })
    }

    if (scrollHeight > (this.data.outsideHeight * 2.5)) {
      this.setData({
        topShow: true
      })
    }else {
      this.setData({
        topShow: false
      })
    }
  },

  toTop: function() {
    this.setData({
      anchor: 'outside'
    })
  },

  loadMore: function(e) {
    if (!this.data.isLoadMode) {
      this.setData({
        isLoadMode: false
      })
      return
    }
    this.getPictures()
  },

  toPreview: function(e) {
    var pindex = getCurrentPages().length - 1;
    app.globalData.pictures[pindex] = this.data.pictures
  },

  toNew: function(e) {
    wx.switchTab({
      url: '/pages/new/new',
    })
  },

  toOther: function(e) {
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url,
    })
  },

  refreshPictures: function() {
    this.setData({
      pictures: [],
      random_picture_ids: [],
    })
    this.getPictures()
  },

//  专辑

    goSpecial: function () {
        wx.navigateTo({
            url: '../special/index/index',
        })
    },
    gohotSpecial: function (e) {
        var index = e.currentTarget.dataset.index;
        var specials = this.data.specials;
        var item = specials[index];
        var sid = item.id;
        var curl = item.cover;
        var title = item.title
        wx.navigateTo({
            url: '../special/show/show?sid=' + sid + '&curl=' + curl + '&title=' + title,
        })
    }
 

})