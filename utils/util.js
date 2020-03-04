import SiteInfo from "../siteInfo.js";
const App = getApp();
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatMD_long = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].join('-')
}
const formatMD = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [month, day].join('.')
}
const formatHM = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  return [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const loadImageError = (e, vm) => {
  let _errImg = e.target.dataset.errImg;
  let _objImg = "'" + _errImg + "'";
  let _errObj = {};
  let _image = e.target.dataset.defaultImage;
  _errObj[_errImg] = _image;
  console.error(e.detail.errMsg + "----" + _errObj[_errImg] + "----" + _objImg);
  vm.setData(_errObj);
}
const request = opt => {
  //Location
  // let Location = wx.getStorageSync('location');
  // delete Location.name;
  // delete Location.address;
  //Token
  // const Token = wx.getStorageSync('access_token');
  //Url
  const Url = SiteInfo["Siteroot"] + opt.url;
  //language & openid
  opt.data.language = wx.getStorageSync('lang')|| App.globalData.lang;
  opt.data.openid = App.globalData.openid||wx.getStorageSync('openid')
  wx.request({
    url: Url,
    data: opt.data ? opt.data : {},
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      // Version: SiteInfo["Version"],
      // Authorization: Token//,
      // Location: JSON.stringify(Location)
    },
    method: opt.method ? opt.method : "POST",
    dataType: opt.dataType ? opt.dataType : "json",
    responseType: opt.responseType ? opt.responseType : "text",
    success: function (res) {
      if (res.data.success == 'true') {
        typeof opt.success == 'function' ? opt.success(res.data.data) : null;;
      } else {
        console.error(`请求发送成功，获取数据失败（${opt.url}） errMsg:${res.data.msg}`);
        if (opt.needAuth&&!App.globalData.userInfoBool) {//!App.globalData.locationBool
          console.error(`此接口需要用户未授权，未授权`);
          let curPage = getCurrentPages();
          // console.log(curPage[curPage.length - 1])
          wx.navigateTo({
            url: '/pages/auth/auth?redirectUrl=/' + curPage[curPage.length-1].route, //跳转到授权页面
          })
        }
      }
    },
    fail: function (res) {
      wx.hideNavigationBarLoading();
      typeof opt.fail == 'function' ? opt.fail(res) : console.error(`请求发送失败（${opt.url}）`);
    },
    complete: function (res) {
      setTimeout(function () {
        wx.hideNavigationBarLoading();
      }, 500)
      typeof opt.complete == 'function' ? opt.complete(res) : null;
    }
  })
}
let util = {
  FormatMD_long: formatMD_long, //时间格式：2019-5-1
  FormatMD: formatMD, //时间格式：5.1
  FormatHM: formatHM, //时间格式：16:00
  FormatTime: formatTime, // 时间格式 ：2019-02-01 10:22:11
  LoadImageError: loadImageError,/**图片加载错误 */
  Request: request/**请求封装 */
}
export default util