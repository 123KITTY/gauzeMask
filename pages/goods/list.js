// pages/goods/list.js
import Util from '../../utils/util.js';
let App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoading:false,
    isLoad:false,//false:加载中,true: 没有更多了
    limit:20,//每页数量
    keyword:'',
    timer:null,
    pageIndex:-1,
    goods:[],
    lang: [{
      name: '中文',
      value: 'chs'
    }, {
      name: 'EN',
      value: 'eng'
    }],
  },

  GetMore:function(){
    if(!this.data.isLoad){
      this.GetGoods(this.data.pageIndex+1);
    }
  },
  //search goods 
  searchGoods:function(e){
    let vm = this;
    vm.data.keyword = e.detail.value;
    let canSearch = false
    clearTimeout(vm.data.timer)
    vm.data.timer = setTimeout(()=>{
      canSearch = true
    },0.2*1000)
    setTimeout(()=>{
      if(canSearch){
        vm.GetGoods()
      }
    },0.4*1000)
  },
  //get goods
  GetGoods: function (pageIndex){
    wx.showNavigationBarLoading();
    let vm= this;
    let page = pageIndex ? pageIndex:0;
    if (page == 0){
      vm.data.goods = []
    }
    Util.Request({
      url: 'm=goods&a=index',
      data:{
        page: page,
        limit: vm.data.limit,
        cate_id:'',
        keyword: vm.data.keyword
      },
      method: 'POST',
      needAuth:false,
      success:function(result){
        let goods = vm.data.goods.concat(result.list);
        vm.data.pageIndex = page
        // console.log(goods)
        vm.setData({
          showLoading: result.total > (vm.data.pageIndex + 1) * vm.data.limit,
          isLoad: result.total <= (vm.data.pageIndex + 1) * vm.data.limit,
          goods: goods
        });
        wx.hideNavigationBarLoading();
      }
    })
  },
  // language
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  changeLang:function(option){
    wx.setStorageSync('lang', option.detail.value);
    App.ChangeLanguage(this);
    wx.setNavigationBarTitle({
      title: this.data.language.good_list[9]
    })
    const name = this.data.lang.filter(z => z.value == option.detail.value)[0].name;
    this.setData({
      curLang: name
    });
    this.GetGoods()
  },
  gotoMyOrder:function(){
    if (this.data.openid){
     this.CheckAuth()
   }else{
     this.CheckWXLogin();
   }
  },
  CheckAuth:function(){
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
  CheckWXLogin:function(){
    let vm = this;
    App.WxLogin().then((res) => {
      vm.data.openid = wx.getStorageSync('openid');
      vm.gotoMyOrder();
    }).catch((msg) => {
      console.error('小程序登录错误(login)：' + msg);
      wx.showToast({
        title: vm.data.language.tips[0],//'小程序登录失败！',
        icon: 'none',
        duration: 2000,
        mask: true
      });
    });
  },
  ChangeLanguage:function(){
    App.ChangeLanguage(this);
    wx.setNavigationBarTitle({
      title: this.data.language.good_list[9]
    })
    this.setData({
      curLang: this.data.lang.filter(z => z.value == App.globalData.lang)[0].name,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.ChangeLanguage();
    this.data.wxInfo = wx.getStorageSync('wxInfo');
    this.GetGoods();
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