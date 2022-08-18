/** index.js **/

//获取app实例
const app = getApp();

Page({
  data: {
    token: wx.getStorageSync("loginFlag"),
    userInfo: {},
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    // 是否登录，根据后台返回的token判断
    hasLogin: wx.getStorageSync("loginFlag") ? true : false,
  },
  onLoad(){
    //登录用户标识
    wx.login({
      success (res) {
        if (res.code) {
          console.log(res.code)
          //发起网络请求
          wx.request({
            url: 'http://localhost:8888/user/getSeesionId',
            method: 'POST',
            header:{
              'content-type':'application/x-www-form-urlencoded',
            },
            data: {
              code: res.code
            },
            success(res){

              if(res.data.code == 200){
                wx.setStorage({//存储到本地
                  key:'sessionId',
                  data:res.data.data
                })
              }else{
                wx.removeStorage({
                  key: 'sessionId',
                })
              }
            }
          })
        } else {
          console.log('发生错误')
        }
      }
    })
},

login: function () {
    console.log("用户按了允许授权按钮");
    app.doLogin(app.switchTheTab);

  },

  onShow: function () {},
});
