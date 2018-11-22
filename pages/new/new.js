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
      isloadMore: true,
      loadFlag: true,
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
      isloadMore: true,
      loadFlag: true,      
      topShow: false
    },
    collects: {
      'pictures': [],
      page: 1,
      isloadMore: true,
      loadFlag: true,      
      topShow: false
    },
    likes: {
      'pictures': [],
      page: 1,
      isloadMore: true,
      loadFlag: true,      
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
    if (this.data.id > 0 && app.globalData.pictures.length > 0) {
      this.setData({
        newPictures: app.globalData.pictures
      })
      app.globalData.pictures = []
    }
  },

  getNewPictures: function () {
    var page = this.data.newParams.page
    if (page == 1) {
      this.getHotPictures(this.data.hotIndex)
      //   专辑
      this.loadFirst();
    }
    this.data.newParams.isloadMore = false    
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
        var oPictures = this.data.newPictures.length > 0 ? app.globalData.pictures : this.data.newPictures
        var newPictures = [];
        if (pictures.length > 0) {
          newPictures = oPictures.concat(pictures)

          this.data.newParams.page = page + 1                 
          this.data.newParams.isloadMore = true    
          
          this.setData({
            newPictures: newPictures,
          });

          app.globalData.pictures = newPictures
        }
        if (newPictures.length >= 500 || newPictures.length == res.data.data.total) {
          this.data.newParams.isloadMore = false   
          this.setData({
            ['newParams.loadFlag']: false
          })
        }
        
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
      if (!this.data.hots.isloadMore) {
        return
      }
    } else if (hotIndex == 1) {
      keyword = 'collect'
      page = this.data.collects.page
      if (!this.data.collects.isloadMore) {
        return
      }
    } else {
      keyword = 'like'
      page = this.data.likes.page
      if (!this.data.likes.isloadMore) {
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
            this.data.hots.isloadMore = true
            this.data.hots.page =page + 1
            this.setData({
              ['hots.pictures']: newPictures,
             
            });
          }
          if (newPictures.length == 100 || newPictures.length == total) {
            this.data.hots.isloadMore = false
            this.setData({
              ['hots.loadFlag']: false,
            });
          }
        } else if (hotIndex == 1) {
          var oPictures = this.data.collects.pictures
          if (pictures.length > 0) {
            newPictures = oPictures.concat(pictures)
            this.data.collects.isloadMore = true
            this.data.collects.page = page + 1
            this.setData({
              ['collects.pictures']: newPictures,
            });
          }
          if (newPictures.length == 100 || newPictures.length == total) {
            this.data.collects.isloadMore = false
            this.setData({
              ['collects.loadFlag']: false,
            });
          }
        } else {
          var oPictures = this.data.likes.pictures
          if (pictures.length > 0) {
            newPictures = oPictures.concat(pictures)
            this.data.likes.isloadMore = true
            this.data.likes.page = page + 1
            this.setData({
              ['likes.pictures']: newPictures,
            });

            if (newPictures.length == 100 || newPictures.length == total) {
              this.data.likes.isloadMore = false
              this.setData({
                ['likes.loadFlag']: false,
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
    
    if (!this.data.newParams.isloadMore) {
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
    this.data.id = e.detail.id
    app.globalData.pictures = this.data.newPictures
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
        var key = 'newPictures[' + i + '].collect'
        this.setData({
          [key]: status
        })
        break;
      }
    }
  },

  getPicture: function() {
    var id = this.data.id
    wx.request({
      url: Config.restUrl + '/pictures/' + id,
      header: {'token': wx.getStorageSync('token')},
      success: res => {
        var picture = res.data.data
        
        if(this.data.tabIndex == 1) {
          var pictures = this.data.newPictures 
          for (var i in pictures) {
            if (pictures[i].id == id) {
              var key = 'newPictures[' + i + ']'
              this.setData({
                [key]: picture
              })
              break;              
            }
          }
        }
        
      }
    })
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