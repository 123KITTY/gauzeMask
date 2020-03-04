import SiteInfo from "../../siteInfo.js";
let App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showUserAuth: false, //是否显示弹框，默认不显示。
    redirectUrl:'/pages/goods/list'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    App.ChangeLanguage(this);
    wx.setNavigationBarTitle({
      title: this.data.language.auth[0]
    })
    //用户授权后重定向Url
    this.data.redirectUrl=options.redirectUrl;
    // console.log(this.data.redirectUrl)
    //登录小程序
    // this.WxLogin();
  },
  /** 登录小程序*/
  WxLogin: function (userInfo) {
    let vm = this;
    App.WxLogin().then((res) => {
      vm.SaveUserInfo(userInfo);
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
  /** 用户点击 授权登录*/
  GetUserInfo: function (e) {
    let vm = this;
    //缓存 用户信息数据 
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      console.log("用户拒绝授权用户信息");
    } else {
      console.log("已同意授权，正在缓存用户信息");
      App.UpdateUserInfo(e.detail.userInfo);
      console.log("保存用户数据");
      // console.log(!App.globalData.openid)
      if (!App.globalData.openid){
        vm.WxLogin(e.detail);
      }else{
        vm.SaveUserInfo(e.detail);
      }
    }
  },
  FormatInfo:function(data){
    let info = {
      openid:App.globalData.openid,
      nickname: data.userInfo.nickName,
      face: data.userInfo.avatarUrl,
      language: App.globalData.lang
    }
    return info
  },
  SaveUserInfo: function (userInformation){
    let vm = this;
    let info = vm.FormatInfo(userInformation);
    let userInfo = App.SaveUserInfo(info);//发送 保存数据的 请求
    userInfo.then((res) => {
      console.log(vm.data.redirectUrl)
      if (vm.data.redirectUrl){
        wx.navigateTo({
          url: vm.data.redirectUrl,
        })
      }
    }).catch(msg => {
      console.error("保存用户数据失败(registered)：" + msg);
    });
  },
  
  navBack:function(){
    wx.navigateBack({
      delta: 1,
    })
  }
})