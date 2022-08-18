//app.js
const api = require("./config/config.js");

App({
  // 小程序启动生命周期
  onLaunch: function () {
    let that = this;
    let userStorageInfo = wx.getStorageSync("userInfo");
    if (userStorageInfo) {
      that.globalData.userInfo = userStorageInfo;
    }
  },

  // 检查本地 storage 中是否有登录态标识
  checkLoginStatus: function () {
    let that = this;
    let loginFlag = wx.getStorageSync("loginFlag");
    if (loginFlag) {
      // 检查 session_key 是否过期
      wx.checkSession({
        // session_key 有效(为过期)
        success: function () {
          // 直接从Storage中获取用户信息
          let userStorageInfo = wx.getStorageSync("userInfo");

          if (userStorageInfo) {
            that.globalData.userInfo = userStorageInfo;
          } else {
            that.showInfo("缓存信息缺失");
            console.error(
              "登录成功后将用户信息存在Storage的userStorageInfo字段中，该字段丢失"
            );
          }
        },
        // session_key 过期
        fail: function () {
          // session_key过期
          that.doLogin();
        },
      });
    } else {
      // 无登录态
      that.doLogin();
    }
  },

  // 公共登录动作
  doLogin: function (callback) {
    let that = this;
    let sessionStorageId = wx.getStorageSync("sessionId")
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        wx.request({
          url: 'http://localhost:8888/user/login',
          method: 'post',
          data: {
            seesionId:sessionStorageId,
            encryptedData: res.encryptedData,
            iv: res.iv
          },
          success: function(res) {
            res = res.data
            wx.setStorageSync("token", res.data.token);
            wx.request({
              url: 'http://localhost:8888/user/userinfo',
              method: 'GET',
              data: {
                token: wx.getStorageSync("token")
              },
              success:function(res){
                that.globalData.userInfo = res.data.data
                wx.setStorageSync("userInfo", res.data.data);
                wx.setStorageSync("loginFlag", wx.getStorageSync("token"));

              }
            })
            wx.switchTab({
              url: "/pages/my/my",
            })
          },
          fail: function (error) {
            console.log(error);
            // 获取 userInfo 失败，去检查是否未开启权限
            wx.hideLoading();
            that.showInfo("调用request接口失败");
            console.log(error);
            wx.navigateTo({
              url: "/pages/index/index",
            })
          }
        })
      }
    })
  },
  
  // 检查用户信息授权设置
  checkUserInfoPermission: function (callback = () => {}) {
    wx.getSetting({
      success: function (res) {
        console.log(res);
        if (!res.authSetting["scope.userInfo"]) {
          wx.openSetting({
            success: function (authSetting) {
              console.log("success:authSetting：");
              console.log(authSetting);
              callback();
            },
            fail: function (error) {
              console.log("fail:authSetting：");
              console.log(error);
            },
          });
        }
      },
      fail: function (error) {
        console.log(用户信息授权设置);
        console.log(error);
      },
    });
  },

  //切换到tab首页
  switchTheTab: function () {
    console.log("回调函数：callback swithcTheTab");
    wx.switchTab({
      url: "/pages/index1/index1",
      success: (result) => {
        console.log(wx.getStorageSync("loginFlag"));
      },
      fail: () => {},
      complete: () => {},
    });
  },

  // 获取用户登录标示 供全局调用
  getLoginFlag: function () {
    return wx.getStorageSync("loginFlag");
  },

  // 封装 wx.showToast 方法
  showInfo: function (info = "error", icon = "none") {
    wx.showToast({
      title: info,
      icon: icon,
      duration: 2000,
      mask: false,
    });
  },


  // app全局数据
  globalData: {
    userInfo: null
  },
});
