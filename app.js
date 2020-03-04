import SiteInfo from "siteInfo.js";
App({
  onLaunch: function () {
    //更新版本
    this.CheckVersion();
    this.globalData.openid = wx.getStorageSync('openid');
    if (!this.globalData.openid){
      this.WxLogin();
    }else{
      this.globalData.userInfoBool = true;
    }
  },
  /**检查小程序版本更新 */
  CheckVersion: function () {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
      console.error('新版本下载失败!')
      wx.showToast({
        title: '新版本下载失败，请检查你的网路链接是否通畅！',
        icon: 'none',
        duration: 2000,
        mask: true
      })
    })
  },
  // 语言切换
  ChangeLanguage: function (vm) {
    this.globalData.lang = wx.getStorageSync('lang')||'chs'
    if (this.globalData.lang == 'eng') {
      vm.setData({
        language: SiteInfo['lang_en']
      })
    } else {
      vm.setData({
        language: SiteInfo['lang_ch']
      })
    }
  },
  /**检查是否授权 */
  CheckAuth: function () {
    return new Promise((resolve,reject)=>{
      var that = this;
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({// 已经授权，可以直接调用 getUserInfo 获取头像昵称
              success: function (res) {
                that.UpdateUserInfo(res.userInfo);
                resolve();
              }
            });
          } else {
            reject()
          }
        }
      })
    })
  },
  /**小程序登录：调用接口获取登录凭证（code） */
  WxLogin: function () {
    return new Promise((resolve, reject) => {
      let vm = this;
      wx.login({
        success(res) {
          if (res.code) {
            //发起网络请求
            wx.request({
              url: SiteInfo["Siteroot"] + 'm=passport&a=getaccess_token',
              // header: {
              //   Version: SiteInfo["Version"]
              // },
              header: {
                'content-type': 'application/x-www-form-urlencoded'//,
                // Version: SiteInfo["Version"]
              },
              method: 'POST',
              data: {
                js_code: res.code
              },
              success(res) {
                if(res.data.openid){
                  vm.UpdateOpenid(res.data.openid);
                  resolve(res.data.openid)
                }else{
                  reject('登录失败！')
                }
              },
              fail(res) {
                wx.hideLoading();
                reject('登录请求失败！' + res.errMsg)
              },
              complete: function (res) {
                wx.hideLoading();
              },
            });
          } else {
            wx.hideLoading();
            reject('微信登录失败！' + res.errMsg)
          }
        },
        fail(res) {
          reject('小程序登录失败！' + res.errMsg);
        }
      })
    });
  },
  UpdateOpenid: function (openid){
    wx.setStorageSync('openid', openid);
    this.globalData.openid = openid;
    this.globalData.userInfoBool = true;
  },
  // UpdateToken: function (obj) {
  //   const token = obj.token_type + ' ' + obj.access_token;
  //   wx.setStorageSync('access_token', token);
  //   this.globalData.userInfoBool = true;
  // },
  UpdateUserInfo: function (userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },
  /** 自定义头部：返回按钮位置 */
  SetHeader: function () {
    return new Promise((resolve, reject) => {
      const vm = this;
      wx.getSystemInfo({
        success: function (res) {
          let totalTopHeight = 82
          if (res.model.indexOf('iPhone X') !== -1) {
            totalTopHeight = 110
          } else if (res.model.indexOf('iPhone') !== -1) {
            totalTopHeight = 64
          }
          vm.globalData.statusBarHeight = res.statusBarHeight;
          vm.globalData.titleBarHeight = totalTopHeight - res.statusBarHeight;
          resolve(res);
        },
        failure() {
          vm.globalData.statusBarHeight = 0;
          vm.globalData.titleBarHeight = 0;
          reject("获取系统信息失败！");
        }
      })
    })

  },
  /** 开始选择地理位置 */
  ChooseLocation: function () {
    let vm = this;
    wx.showLoading({
      title: '获取地理位置',
      mask: true,
    });
    setTimeout(() => {
      wx.hideLoading()
      wx.chooseLocation({
        success: (res) => {
          // console.log(res);
          if (res.errMsg == "chooseLocation:ok") {
            if (res.address == "") {
              vm.CancelChooseLocation()
            } else {
              delete res.errMsg;
              vm.globalData.locationBool = true; //
              wx.setStorageSync("location", res) //将地理位置缓存
              vm.GetLoacationOrGoHome(); //前往首页
            }
          } else {
            console.error(res.errMsg);
          }
        },
        fail: (res) => {
          vm.CancelChooseLocation()
          // if (res.errMsg == "chooseLocation:fail cancel") {
          //   vm.CancelChooseLocation()
          // } else if (res.errMsg =="chooseLocation:fail auth deny"){
          //   wx.showModal({
          //     content: 'motiva 需要获取你的位置来定位附近的场地。',
          //     showCancel: false,
          //     success(res) {
          //       if (res.confirm) {
          //         vm.ChooseLocation()
          //       }
          //     }
          //   })
          // }
          console.error("chooseLocation:" + res.errMsg);
        },
        complete: () => { }
      });
    }, 500)
  },
  /**用户取消选择地理位置 */
  CancelChooseLocation: function () {
    let vm = this;
    let location_name = wx.getStorageSync('location').name;
    if (!location_name) {
      wx.showModal({
        content: '点击确定在地图下方选择您的地理位置，nunumua 需要定位你附近的场地。',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            vm.ChooseLocation()
          }
        }
      })
    }
  },
  /** 完成授权和地理位置 之后返回首页 */
  GetLoacationOrGoHome: function () {
    // let location = wx.getStorageSync("location");
    // if (location) {
    var pages = getCurrentPages();
    if (pages.length == 1) {
      wx.switchTab({
        url: '/pages/home/index/index'
      })
    } else {
      wx.navigateBack({
        delta: 2
      })
    }

    // } else {
    //   this.ChooseLocation();
    // }
  },
  
  /**获取用户信息 */
  SaveUserInfo: function (userInfo) {
    let vm = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: SiteInfo["Siteroot"] + 'm=passport&a=sysweixininfo',
        header: {
          'content-type': 'application/x-www-form-urlencoded'//,
          // Version: SiteInfo["Version"]
        },
        method: 'POST',
        data: userInfo,
        success(res) {
          res.data && res.data.success == 'true' ? resolve(res.data.data) : reject(res.data.message);
        },
        fail(res) {
          wx.hideLoading();
          console.log('用户注册失败！' + res.errMsg)
        },
        complete: function (res) {
          wx.hideLoading();
        },
      });

    })
  },
  globalData: {
    lang:'chs',
    openid:'',
    statusBarHeight: 0,
    titleBarHeight: 0,
    userInfo: null,//用户信息
    location: null,//用户地理位置
    userInfoBool: false,//用户授权
    locationBool: false,//用户定位
    needReauth: false //是否需要重新授权
  
  }
});