// pages/order/detail.js
import SiteInfo from '../../siteInfo.js'
import Util from '../../utils/util.js';
let App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSubmited:false,
    isLoading:false,
    good_id: null,
    goodDetail:null,
    order_id: null,
    orderDetail:null,
    // buyer_name: 'si.li',
    // buyer_cardid: '321183199502263226',
    // buyer_address: '江苏省句容市茅山风景区余家棚自然村27号',
    // buyer_number: 1000,
    // buyer_freight: 200,
    // buyer_pic_url: [],
    // buyer_awb:'',
    // note: ''
  },
  DelImg(e) {
    this.setData({
      modalName:'delImg'
    })
    this.data.delIndex = e.currentTarget.dataset.index;
    // wx.showModal({
    //   title: this.data.language.tips[1],//提示
    //   content: this.data.language.tips[2],//确定删除？
    //   cancelText: this.data.language.tips[3],//取消
    //   confirmText: this.data.language.tips[4],//确定
    //   success: res => {
    //     if (res.confirm) {
    //       this.data.orderDetail.buyer_pic_url.splice(e.currentTarget.dataset.index, 1);
    //       this.setData({
    //         ['orderDetail.buyer_pic_url']: this.data.orderDetail.buyer_pic_url
    //       })
    //     }
    //   },
    //   fail:function(res){
    //     console.log(res)
    //   }
    // })
  },
  cancelDelImg:function(){
    this.setData({
      modalName: ''
    })
  },
  confirmDelImg:function(){
    this.data.orderDetail.buyer_pic_url.splice(this.data.delIndex, 1);
    this.setData({
      ['orderDetail.buyer_pic_url']: this.data.orderDetail.buyer_pic_url,
      modalName:''
    })
  },
  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album','camera'], //从相册选择
      success: (res) => {
        if (this.data.orderDetail.buyer_pic_url.length != 0) {
          this.setData({
            ['orderDetail.buyer_pic_url']: this.data.orderDetail.buyer_pic_url.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            ['orderDetail.buyer_pic_url']: res.tempFilePaths
          })
        }
      }
    });
  },
  UploadFile: function (){
    let vm = this;
    wx.showLoading({
      title: vm.data.language.tips[5],//正在提交
      mask: true
    })
    this.setData({
      isLoading:true
    })
    for (let i = 0; i < this.data.orderDetail.buyer_pic_url.length;i++){
      let item = this.data.orderDetail.buyer_pic_url[i]
      wx.uploadFile({
        url: SiteInfo['Siteroot'] + 'm=order&a=uploadpic',
        filePath: item,
        name: 'file',
        formData: {
          'language': App.globalData.lang
        },
        success(res) {
          const data = JSON.parse(res.data)
          if (data.success == 'true'){
            vm.UpdateOrder(data.data.pic_url)
          }else{
            wx.showToast({
              title: vm.data.language.tips[6],//'操作失败！请稍后重试',
              icon:'none',
              mask:true
            })
          }
          vm.setData({
            isLoading: false
          })
        },
        fail:function(){
          wx.showToast({
            title: vm.data.language.tips[6],//'操作失败！请稍后重试',
            icon: 'none',
            mask: true
          })
          vm.setData({
            isLoading: false
          })
        }
      })
    }
    
  },
  UpdateOrder:function(url){
    let vm = this;
    Util.Request({
      url:'m=order&a=updateorder',
      data:{
        order_id: vm.data.order_id,
        buyer_pic_url: url,
      },
      success:function(){
        wx.showToast({
          title: vm.data.language.tips[7],//'提交成功！',
          mask: true
        })
        vm.setData({
          isLoading: false,
          isSubmited:true
        })
      }
    })
  },
  ViewImage(e) {
    let vm = this;
    wx.previewImage({
      urls: vm.data.orderDetail.buyer_pic_url,
      current: e.currentTarget.dataset.url
    });
  },
  getGoodDetails: function () {
    wx.showNavigationBarLoading();
    let vm = this;
    Util.Request({
      url: 'm=goods&a=detail',
      data: {
        goods_id: vm.data.good_id
      },
      method: 'POST',
      needAuth: false,
      success: function (result) {
        vm.setData({
          goodDetail: result.detail
        })
      }
    })
  },
  getOrderDetails: function () {
    wx.showNavigationBarLoading();
    let vm = this;
    Util.Request({
      url: 'm=user&a=getmyorderdetail',
      data: {
        order_id: vm.data.order_id
      },
      method: 'POST',
      needAuth: false,
      success: function (result) {
        // console.log(result)?
        const buyer_pic_url = result.buyer_pic_url ? [result.buyer_pic_url]:[];
        result.buyer_pic_url = buyer_pic_url;
        vm.setData({
          orderDetail: result,
          isSubmited: result.buyer_pic_url.length>0
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
      title: this.data.language.order_detail[0]
    })
    this.data.order_id = options.orderId;
    this.data.good_id = options.goodId;
    this.getGoodDetails();
    this.getOrderDetails();
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