import {
  Config
} from "../../utils/config.js"
import {
  Token
} from "../../utils/token.js"

const token = new Token
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swipers: [],
    tags: [],
    specials: [],
    pictures: [],
    random_picture_ids: [],
    title: 'P站星选',
    page: 1,
    isLoadMore: true,
    loadFlag: true,
    topShow: false,
    anchor: '',
    carouselIndex: 0,
    tipFlag: !wx.getStorageSync('tip_staus'),
    adsFlag: false,
    adError: false,
    fullAdFlag: true,
    countDownNum: 5,
    fullAdurl:'https://download.rdoorweb.com/20181122/605a360c39cef8716a10d2d96639fc54.jpg',
    todayShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    token.verify(this.getSwipers);
    this.getElementHeight();
    wx.hideTabBar();
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
    if (this.data.swipers.length > 0) {
      this.getTags();
    }
    if (this.data.id > 0 && app.globalData.pictures.length > 0) {
      // token.verify(this.getPicture)
      this.setData({
        pictures: app.globalData.pictures
      })
      app.globalData.pictures = []
    }
    this.countDown();
  },

  getNotices: function () {
    var page = this.data.page
    wx.request({
      url: Config.restUrl + '/notices',
      header: {
        'token': wx.getStorageSync('token')
      },
      success: res => {
        if (res.data.status == 'success') {
          if (res.data.count > 0) {
            wx.showTabBarRedDot({
              index: 4
            })
          }
        }
      }
    })
  },

  onSlideChangeEnd: function (e) {
    var that = this;
    that.setData({
      carouselIndex: e.detail.current
    })
  },

  getSwipers: function () {
    wx.request({
      url: Config.restUrl + '/swiper_groups/display',
      header: {
        'token': wx.getStorageSync('token')
      },
      method: 'get',
      success: res => {
        var swpiers = res.data.data.swipers
        this.setData({
          swpiers: swpiers
        })
        this.getTags()
        this.getSpecials()
        this.getPictures()
        this.getNotices()
        this.getAds()
      }
    })
  },

  getTags: function () {
    wx.request({
      url: Config.restUrl + '/tags/random',
      header: {
        'token': wx.getStorageSync('token')
      },
      method: 'get',
      success: res => {
        var tags = res.data.data
        this.setData({
          tags: tags
        })
      }
    })
  },

  getSpecials: function () {
    wx.request({
      url: Config.restUrl + '/specials/hot',
      header: {
        'token': wx.getStorageSync('token')
      },
      success: res => {
        var specials = res.data.data
        this.setData({
          specials: specials
        })
      }
    })
  },

  getPictures: function (page) {
    var random_picture_ids = this.data.random_picture_ids
    this.data.isLoadMore = false

    wx.request({
      url: Config.restUrl + '/pictures/random',
      header: {
        'token': wx.getStorageSync('token')
      },
      data: {
        random_picture_ids: random_picture_ids,
        page: page
      },
      method: 'post',
      success: res => {
        var pictures = res.data.data
        var oPictures = this.data.pictures
        var newPictures = [];
        var index = oPictures.length

        if (pictures.length > 0) {
          newPictures = oPictures.concat(pictures)
          this.data.isLoadMore = true
          this.data.page = page + 1
          this.data.random_picture_ids = res.data.random_picture_ids
          this.setData({
            pictures: newPictures,

          });

        }

        if (newPictures.length >= 300 || pictures.length == 0) {
          this.data.isLoadMore = false
          this.setData({
            loadFlag: false
          })
        }
      }
    })
  },

  getAds: function () {
    wx.request({
      url: Config.restUrl + '/ads/app',
      header: {
        'token': wx.getStorageSync('token')
      },
      success: res => {
        var ads = res.data.data
        for (var i in ads) {
          if (ads[i].page == 'Index') {
            this.setData({
              adsFlag: true
            })
            break;
          }
        }
      }
    })
  },

  adError: function (e) {
    this.setData({
      adError: true
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

  scroll: function (e) {
    var scrollHeight = e.detail.scrollTop
    if (scrollHeight > this.data.outsideHeight) {
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
    } else {
      this.setData({
        topShow: false
      })
    }
  },

  toTop: function () {
    this.setData({
      anchor: 'outside'
    })
  },

  loadMore: function (e) {
    if (!this.data.isLoadMore) {
      return
    }
    this.getPictures()
  },

  getPicture: function () {
    var id = this.data.id
    wx.request({
      url: Config.restUrl + '/pictures/' + id,
      header: {
        'token': wx.getStorageSync('token')
      },
      success: res => {
        var picture = res.data.data
        var pictures = this.data.pictures
        for (var i in pictures) {
          if (pictures[i].id == id) {
            var key = 'pictures[' + i + ']'
            break;
          }
        }
        this.setData({
          [key]: picture
        })
      }
    })
  },

  toPreview: function (e) {
    this.data.id = e.detail.id
    app.globalData.pictures = this.data.pictures
  },

  collect: function (e) {
    this.data.id = e.detail.id
    this.setPictures(1)
  },

  uncollect: function (e) {
    this.data.id = e.detail.id
    this.setPictures(0)
  },

  setPictures: function (status) {
    var pictures = this.data.pictures
    for (var i in pictures) {
      if (pictures[i].id == this.data.id) {
        var key = 'pictures[' + i + '].collect'
        this.setData({
          [key]: status
        })
        break;
      }
    }
  },

  toNew: function (e) {
    app.globalData.newTab = 1;
    wx.switchTab({
      url: '/pages/new/new',
    })
  },

  toOther: function (e) {
    var url = e.currentTarget.dataset.url
    var to_type = e.currentTarget.dataset.type
    if (to_type == 0) {
      wx.navigateTo({
        url: url,
      })
    } else {
      wx.switchTab({
        url: url,
      })
    }

  },

  refreshPictures: function () {
    this.setData({
      pictures: [],
      random_picture_ids: [],
      loadFlag: true
    })
    this.getPictures()
  },

  //  专辑

  goSpecial: function () {
    app.globalData.newTab = 2;
    wx.switchTab({
      url: '/pages/new/new'
    })
  },
  gohotSpecial: function (e) {
    var index = e.currentTarget.dataset.index;
    var specials = this.data.specials;
    var item = specials[index];
    var sid = item.id;
    wx.navigateTo({
      // url: '../special/show/show?sid=' + sid + '&curl=' + curl + '&title=' + title,
      url: '../special/show/show?sid=' + sid,
    })
  },

  onShareAppMessage: function () {
    return {
      title: 'P站星选',
    }
  },

  colseTip: function (e) {
    wx.setStorageSync('tip_staus', true)
    this.setData({
      tipFlag: false
    })
  },

  toSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },

  toToday: function () {
    wx.navigateTo({
      url: '/pages/today2/today',
    })
  },

  countDown: function () {
    let that = this;
    let countDownNum = that.data.countDownNum;//获取倒计时初始值
    //如果将定时器设置在外面，那么用户就看不到countDownNum的数值动态变化，所以要把定时器存进data里面
    that.setData({
      timer: setInterval(function () {//这里把setInterval赋值给变量名为timer的变量
        //每隔一秒countDownNum就减一，实现同步
        countDownNum--;
        //然后把countDownNum存进data，好让用户知道时间在倒计着
        that.setData({
          countDownNum: countDownNum
        })
        //在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
        if (countDownNum == 0) {
          //这里特别要注意，计时器是始终一直在走的，如果你的时间为0，那么就要关掉定时器！不然相当耗性能
          //因为timer是存在data里面的，所以在关掉时，也要在data里取出后再关闭
          that.hidefullAd();
          //关闭定时器之后，可作其他处理codes go here
        }
      }, 1000)
    })
  },
  hidefullAd: function () {
    clearInterval(this.data.timer);

    this.setData({
      fullAdFlag: false,
      todayShow: true
    })
    wx.showTabBar();
  }
})