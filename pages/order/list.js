// pages/order/list.js
import Util from '../../utils/util.js';
let App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isEmpty:false,
    isLoad: false,//false:加载中,true: 没有更多了
  },
  gotoDetail:function(e){
    // console.log(e)
    const orderid = e.currentTarget.dataset['orderid'];
    const goodid = e.currentTarget.dataset['goodid']
    wx.navigateTo({
      url: '/pages/order/detail?orderId=' + orderid + '&goodId=' + goodid,
    })
  },
  getOrders:function(){
    let vm = this;
    Util.Request({
      url:'m=user&a=getmyorderlist',
      data:{},
      needAuth:true,
      success:function(result){
        // console.log(result)
        vm.setData({
          list: result,
          isLoad: true,
          isEmpty:result.length==0
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    App.ChangeLanguage(this);
    wx.setNavigationBarTitle({
      title: this.data.language.order_list[0]
    })
    this.setData({
      isLoad:false
    })
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
    this.getOrders()
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

  }
})