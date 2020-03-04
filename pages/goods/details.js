// pages/goods/details.js
import Util from '../../utils/util.js';
import WP from '../../utils/wxParse/wxParse.js';
let App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curGoodId:null,
    detail:null,
    swiperList: [],
  },
  buy:function(){
    let redirectUrl = '/pages/order/edit?goodId=' + this.data.curGoodId;
    let url = App.globalData.userInfoBool ? redirectUrl : '/pages/auth/auth?redirectUrl=' + redirectUrl;
    wx.navigateTo({ url: url })
  },
  gotoHome: function () {
    wx.navigateTo({
      url: '/pages/goods/list'
    })
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  gotoMyOrder: function () {
    if (this.data.openid) {
      this.CheckAuth()
    } else {
      this.CheckWXLogin();
    }
  },
  CheckAuth: function () {
    App.CheckAuth().then(() => {
      wx.navigateTo({
        url: '/pages/order/list'
      })
    }).catch(() => {
      wx.navigateTo({
        url: '/pages/auth/auth?redirectUrl=/pages/order/list'
      })
    });
  },
  CheckWXLogin: function () {
    let vm = this;
    App.WxLogin().then((res) => {
      vm.data.openid = wx.getStorageSync('openid');
      vm.gotoMyOrder();
    }).catch((msg) => {
      console.error('小程序登录错误(login)：' + msg);
      wx.showToast({
        title: '小程序登录失败！',
        icon: 'none',
        duration: 2000,
        mask: true
      });
    });
  },
  goOrderList: function () {
    wx.navigateTo({
      url: '/pages/order/list'
    })
  },
  getDetails:function(e){
    wx.showNavigationBarLoading();
    let vm = this;
    Util.Request({
      url: 'm=goods&a=detail',
      data:{
        goods_id: vm.data.curGoodId
      },
      method:'POST',
      needAuth:false,
      success:function(result){
        let detail = result.detail;
        let swiperList = [{ //目前只有一张
          url: detail.photo,
        }]
        vm.setData({
          swiperList,
          detail
        })
        WP.wxParse("wxParseData_buycontent", "html", result.detail.details, vm, "0")
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    App.ChangeLanguage(this);
    wx.setNavigationBarTitle({
      title: this.data.language.good_detail[0]
    })
    this.data.curGoodId = options.id;
    this.getDetails();
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})