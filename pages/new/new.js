import {
  Config
} from "../../utils/config.js"
import {
  Token
} from "../../utils/token.js"
const token = new Token
const app = getApp()

var page = 1;
var total = 0;
var per_page = 0;
var all_page = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ['排行', '最新', '专辑'],
    tabIndex: 1,
    newPictures: [],
    newParams: {
      page: 1,
      isLoadMode: true,
      topShow: false
    },
    hotPictures: [],
    anchor: '',
    hotIndex: 0,
    fixedText: '热度榜',
    hotFlag: false,
    hots: {
      'pictures': [],
      page: 1,
      isLoadMode: true,
      topShow: false
    },
    collects: {
      'pictures': [],
      page: 1,
      isLoadMode: true,
      topShow: false
    },
    likes: {
      'pictures': [],
      page: 1,
      isLoadMode: true,
      topShow: false
    },
    // 专辑
    hidden: true,
    flag_search: true,
    list: [],
    scrollTop: 0,
    scrollHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    token.verify(this.getNewPictures)
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

  },

  getNewPictures: function () {
    var page = this.data.newParams.page
    wx.request({
      url: Config.restUrl + '/pictures/app_list',
      header: {
        'token': wx.getStorageSync('token')
      },
      data: {
        page: page
      },
      success: res => {
        var pictures = res.data.data.data
        var oPictures = this.data.newPictures
        var newPictures = [];
        if (pictures.length > 0) {
          newPictures = oPictures.concat(pictures)
          this.setData({
            newPictures: newPictures,
            ['newParams.isLoadMode']: true,
            ['newParams.page']: page + 1,
          });
          var pindex = getCurrentPages().length - 1;
          app.globalData.pictures[pindex] = newPictures
        }
        if (newPictures.length >= 500 || newPictures.length == res.data.data.total) {
          this.setData({
            ['newParams.isLoadMode']: false
          });
        }
        this.getHotPictures(this.data.hotIndex)
        //   专辑
        this.loadFirst();
      }
    })
  },

  getHotPictures: function (index) {
    var keyword = ''
    var page = 1
    var hotIndex = index;
    if (hotIndex == 0) {
      keyword = 'hot'
      page = this.data.hots.page
      if (!this.data.hots.isLoadMode) {
        return
      }
    } else if (hotIndex == 1) {
      keyword = 'collect'
      page = this.data.collects.page
      if (!this.data.collects.isLoadMode) {
        return
      }
    } else {
      keyword = 'like'
      page = this.data.likes.page
      if (!this.data.likes.isLoadMode) {
        return
      }
    }
    wx.request({
      url: Config.restUrl + '/pictures/rank?keyword=' + keyword,
      header: {
        'token': wx.getStorageSync('token')
      },
      data: {
        page: page
      },
      success: res => {
        var pictures = res.data.data.data
        var total = res.data.data.total
        var newPictures = [];

        if (hotIndex == 0) {
          var oPictures = this.data.hots.pictures
          if (pictures.length > 0) {
            newPictures = oPictures.concat(pictures)
            this.setData({
              ['hots.pictures']: newPictures,
              ['hots.isLoadMode']: true,
              ['hots.page']: page + 1,
            });
          }
          if (newPictures.length == 100 || newPictures.length == total) {
            this.setData({
              ['hots.isLoadMode']: false
            });
          }
        } else if (hotIndex == 1) {
          var oPictures = this.data.collects.pictures
          if (pictures.length > 0) {
            newPictures = oPictures.concat(pictures)
            this.setData({
              ['collects.pictures']: newPictures,
              ['collects.isLoadMode']: true,
              ['collects.page']: page + 1,
            });
          }
          if (newPictures.length == 100 || newPictures.length == total) {
            this.setData({
              ['collects.isLoadMode']: false
            });
          }
        } else {
          var oPictures = this.data.likes.pictures
          if (pictures.length > 0) {
            newPictures = oPictures.concat(pictures)
            this.setData({
              ['likes.pictures']: newPictures,
              ['likes.isLoadMode']: true,
              ['likes.page']: page + 1
            });

            if (newPictures.length == 100 || newPictures.length == total) {
              this.setData({
                ['likes.isLoadMode']: false
              });
            }
          }
        }
        this.setData({
          hotPictures: newPictures
        })
      }
    })
  },




  loadNewPictures: function () {
    if (!this.data.newParams.isLoadMode) {
      this.setData({
        ['newParams.isLoadMode']: false
      })
      return
    }
    this.getNewPictures()
  },

  change: function (e) {
    var current = e.detail.current
    this.setData({
      tabIndex: current,
      topShow: false
    })
  },

  tabChoose: function (e) {
    var index = e.detail.index
    this.setData({
      tabIndex: index,
    })
  },

  scroll: function (e) {
    var scrollHeight = e.detail.scrollTop
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

  toPreview: function (e) {
    var pictures = []
    var pindex = getCurrentPages().length - 1;

    if (this.data.tabIndex == 0) {
      pictures = this.data.hotPictures
    } else {
      pictures = this.data.newPictures
    }

    app.globalData.pictures[pindex] = pictures
  },

  getHotIndex: function (e) {
    var index = e.currentTarget.dataset.index
    var fixedText = ''
    var hotPictures = []
    if (index == 0) {
      fixedText = '热度榜'
      if (this.data.hots.pictures.length == 0) {
        this.getHotPictures(index)
      } else {
        hotPictures = this.data.hots.pictures
      }
    } else if (index == 1) {
      fixedText = '收藏榜'
      if (this.data.collects.pictures.length == 0) {
        this.getHotPictures(index)
      } else {
        hotPictures = this.data.collects.pictures
      }
    } else {
      fixedText = '点赞榜'
      if (this.data.likes.pictures.length == 0) {
        this.getHotPictures(index)
      } else {
        hotPictures = this.data.likes.pictures
      }
    }
    this.setData({
      hotIndex: index,
      fixedText: fixedText,
    })

    if (hotPictures.length > 0) {
      this.setData({
        hotPictures: hotPictures
      })
    }
  },

  hotScroll: function (e) {
    var scrollHeight = e.detail.scrollTop
    if (scrollHeight >= 70 && !this.data.hotFlag) {
      this.setData({
        hotFlag: true
      })
      return
    }

    if (scrollHeight < 70) {
      this.setData({
        hotFlag: false
      })
      return
    }
  },

  loadHotPictures: function () {
    var hotIndex = this.data.hotIndex
    this.getHotPictures(hotIndex)
  },

  //   专辑
  //页面滑动到底部
  bindDownLoad: function () {
    var that = this;
    page = page + 1;
    if (page <= all_page) {
      this.loadMore();
    }
  },
  specialScroll: function (event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },
  loadFirst: function () {
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
      success: function (res) {
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
  loadMore: function () {
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
      success: function (res) {
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
  showTap: function (e) {
    var dataset = e.currentTarget.dataset;
    var sid = dataset.sid;
    var curl = dataset.curl;
    var title = dataset.title;
    wx.navigateTo({
      url: '../special/show/show?sid=' + sid + '&curl=' + curl + '&title=' + title,
    })
  },
  // 搜索
  showSearch: function (e) {
    wx.navigateTo({
      url: '../special/search/search',
    })
  },

  onShareAppMessage: function () {
    return {
      title: 'P站星选',
    }
  },
})