// pages/books/books.js

// 获取服务器接口地址
const api = require("../../config/config.js");
// 获取app应用实例
const app = getApp();



Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasLogin: false,
    img_arr: [],
    formdata: '',
    // indicatorDots: true, // 是否显示轮播指示点
    // autoplay: true, // 是否自动播放轮播
    // interval: 5000, // 轮播间隔
    // duration: 1000, // 轮播播放延迟
    // circular: true, // 是否采用衔接滑动
    // sideMargin: "100rpx", // 幻灯片前后边距
    // showLoading: true, // 是否显示loading态
    userInfo: {
      nickName: "未登录",
      avatarUrl: "../../images/login.png",
    }, // 用户信息
    bannerList: [
      { url: "../../images/banner1.jpg" },
      { url: "../../images/banner2.jpg" },
    ],
  },



  onLogin: function () {
    let that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting["scope.userInfo"]) {
          wx.getUserInfo({
            success: function (res) {
              console.log("用户已经授权过了");
              console.log("app.globalData.userInfo", app.globalData.userInfo);
              that.setData({
                userInfo: app.globalData.userInfo,
              });
              if (that.data.userInfo == null) {
                app.doLogin();
              }
            },
            fail: function (res) {
              wx.switchTab({
                url: "/pages/index/index",
                success: (result) => {},
                fail: () => {},
                complete: () => {},
              });
            },
          });
        }
      },
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(app.globalData.userInfo);
    if (app.globalData.userInfo) {
      this.setData({
        hasLogin: true,
        userInfo: app.globalData.userInfo,
      });

    } else {
      this.setData({
        hasLogin: false,
        userInfo: {
          nickName: "未登录",
          avatarUrl: "../../images/login.png",
        },
      });
    }
  },


  goIndex: function () {
    if (!app.globalData.userInfo) {
      console.log("去往登录页");
      wx.navigateTo({
        url: "../index/index",
        success: (result) => {},
        fail: () => {},
        complete: () => {},
      });
    }
  },

  choose:function(){
    let that = this;
    if(that.data.hasLogin){
      //这里小程序规定最好只能选9张，我这里随便填的3，你也可以自己改
      if (this.data.img_arr.length < 3) {
        wx.chooseImage({
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
            that.setData({
              img_arr: that.data.img_arr.concat(res.tempFilePaths)
            });
          }
        })
      } else {
        wx.showToast({
          title: '最多上传三张图片',
          icon: 'loading',
          duration: 3000
        });
      }

    }else{
      console.log("未登录")
      wx.navigateTo({
        url: "../index/index",
        success: (result) => {},
        fail: () => {},
        complete: () => {},
      });
    }
  },

  Sub:function(){
    let that = this;
    if(that.data.hasLogin){
      this.uploadFile(0)
    }else{
      console.log("未登录")
      wx.navigateTo({
        url: "../index/index",
        success: (result) => {},
        fail: () => {},
        complete: () => {},
      });
    }
  },


  //上传图片
  uploadFile: function (index) {
    var that = this
    //如果所有图片都已经上传完，就不再往下执行
    if (index >= that.data.img_arr.length) {
      console.log("上传完成")
      wx.showToast({
        title: '上传完成'
      });
      return
    }
    wx.uploadFile({
      url: 'http://localhost:8888/upload/picture', //自己的Java后台接口地址
      filePath: that.data.img_arr[index],
      name: 'con',
      header: {
        "Content-Type": "multipart/form-data",
        'accept': 'application/json',
        'Authorization': wx.getStorageSync('token') //若有token，此处换上你的token，没有的话省略
      },
      success: function (res) {
        console.log(`第${index+1}张上传成功`, res)
        index++
        that.uploadFile(index)
      },
      fail(res) {
        console.log(`第${index+1}张上传失败`, res)
      }
    })
  }


});
