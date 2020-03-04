// pages/order/edit.js
import Util from '../../utils/util.js';
let App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCreated:false,
    isLoading:false,
    goods_id:null,
    order_id:null,
    buyer_name:'',
    buyer_cardid:'',
    buyer_address:'',
    buyer_number:1,
    buyer_freight:0,
    // buyer_pic_url: [],
    // buyer_awb:1000,
    note:''
  },
  gotoDetail: function () {
    let vm = this;
    wx.navigateTo({
      url: '/pages/order/detail?orderId=' + vm.data.order_id + '&goodId=' + vm.data.goods_id,
    })
  },
  //formSubmit
  formSubmit:function(e){
    this.setData({
      isLoading:true
    })
    let tip = null
    for(let name in e.detail.value){
      let value = e.detail.value[name];
      switch (name) {
        case 'buyer_name':
          if(!value.trim()){
            tip = this.data.language.tips[8]//'请输入采购人姓名'
          }else{
            if (!value.trim().match(/^([a-zA-Z]+)\.([a-zA-Z]+)$/)){
              tip = this.data.language.tips[9]//'请检查姓名格式是否正确'
            }
          }
          break;
        case 'buyer_cardid':
          if (!value.trim()) {
            tip = this.data.language.tips[10]//'请输入采购人身份证'
          }
          break;
        case 'buyer_address':
          if (!value.trim()) {
            tip = this.data.language.tips[11]//'请输入采购人地址'
          }
          break;
        case 'buyer_number':
          if (value<=0) {
            tip = this.data.language.tips[12]//'采购数量至少是 1 '
          }
          break;
        case 'buyer_freight':
          if (value<0) {
            value = 0
          }
          break;
        // case 'buyer_pic_url':
        //   if (!value[0].length) {
        //     tip = '请上传付款流水'
        //   }
        //   break;
        // case 'buyer_awb':
        //   if (!value.trim()) {
        //     tip = '输入采购 DHL AWB'
        //   }
        //   break;
        default:
        break
      }
      if(tip){
        wx.showToast({
          title: tip,
          icon: 'none',
          mask: true
        });
        this.setData({
          isLoading: false
        })
        return 
      }else{
        tip=null;
      }
    }
    if(!tip){
      e.detail.value.goods_id = this.data.goods_id;
      console.log(e.detail.value)
      this.createOrder(e.detail.value)
    }
  },
  createOrder: function (data) {
    let vm = this;
    Util.Request({
      url: 'm=order&a=saveorder',
      data:  data,
      method: 'POST',
      needAuth: true,
      success: function (result) {
        vm.data.order_id = result.order_id;
        vm.setData({
          isLoading: false,
          isCreated:true,
          modalName:'submitSuccess'
        })
      }
    })
  },
 
  gotoHome:function(){
    wx.navigateTo({
      url: '/pages/goods/list'
    })
  },
  goback:function(){
    wx.navigateBack({
      delta:1
    })
  },
  goOrderList:function(){
    wx.navigateTo({
      url: '/pages/order/list'
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    App.ChangeLanguage(this);
    wx.setNavigationBarTitle({
      title: this.data.language.order_edit[1]
    })
    this.data.goods_id = options.goodId
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

  }
})