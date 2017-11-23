angular.module('starter.services', [])
  .filter('bankItem', function() {
    return function(input) {
      // input = "************"+input.substr(12)
      var array = input.replace(/(.{4})(?=.)/g, "$1 ");
      return array;
    }
  })
  .filter('phoneHide', function() {
    return function(input) {
      if (input == null) return '';
      var array = input.substr(0, 3) + '****' + input.substr(7, 4);
      return array;
    }
  })
  .factory('cordovaPlug', function(toast) {
    $cordovaPlugreturn = {
      CommonPL: function(success, functionName, parameter) {
        try {
          cordova.exec(function(data) {
            success instanceof Function && success(data);
          }, $cordovaPlugreturn.CommonPLError, "CommonPL", functionName, parameter);
        } catch (e) {}
      },
      CommonPLError: function(error) {
        toast.show(error)
      }
    };
    return $cordovaPlugreturn;
  })
  .factory('toast', function(ionicToast) {
    // 静默消息
    $toast = {
      show: function(message) {
        ionicToast.show(message, 'bottom', false, 2000)
      }
    };
    return $toast;
  })
  .factory('Common', function($http,$location, $ionicLoading, $ionicPopup, toast, cordovaPlug, $state, $rootScope, $timeout, actionSheetItem) {
    //var app_url = 'http://testlife.365gl.com/',
    var app_url = 'https://life.365gl.com/',
      //debug_url = 'http://192.168.0.77:8080/',
      //debug_url = 'https://life.365gl.com/' ,
      //debug_url = 'http://192.168.0.136:8080/',
      debug_url = 'http://testlife.365gl.com/',
      mock_url = 'http://192.168.0.136:8080/',
      //config_url = './life/',
      config_url = 'http://image-cdn.365gl.com/life/',
      //config_url = 'http://192.168.0.155/life/',
      ClientVer = '6.2.0',
      url_overtime = 30000,
      isDebug = false, //是否开启测试
      isAleart = false, //被挤下线弹框提醒
      isError = false,
      nowTimer = '';

    $return = {
      app_url: app_url,
      ClientVer: ClientVer,
      isDebug: isDebug,
      config_url: config_url,
      showLoading: function(_timer) {
        var myTimer = _timer ? 200000 : 10000;
        $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          template: '<div id="gl_loading" class="spinnere"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>',
          duration: myTimer
        });
        $timeout(function() {
          nowTimer = new Date().getTime();
          var htmlEl = angular.element(document.querySelector('.loading-container'));

          htmlEl.on('click', function(event) {
            console.log(new Date().getTime() - nowTimer)
            if (_timer) {
              if (new Date().getTime() - nowTimer > _timer) {
                $return.showConfirm('退出提醒', '交易支付中，您确定退出么？', function() {
                  $state.go('tab.index');
                  $return.hideLoading();
                }, function() {
                  //$return.showLoading(1000)
                }, '确定', '继续等待');
              }
            }
          });
        }, 0)

      },
      hideLoading: function() {
        $ionicLoading.hide();
      },
      showAlert: function(title, template, then, okText) {
        if (!isError) {
          var okText = okText || '我知道了';
          isError = true;
          var alertPopup = $ionicPopup.alert({
            template: template,
            okText: okText,
            okType: 'button-light'
          });
          alertPopup.then(function(res) {
            isError = false;
            then instanceof Function && then(res);
          });

          // return function() {
          //   alertPopup.close()
          //   isError = false;
          // }
        }
        setTimeout(function () {
              isError = false;
        },3000)
      },
      showConfirm: function(title, template, ok, cancel, okText, cancelText) {
        if (!isAleart) {
          isAleart = true;
          var confirmPopup = $ionicPopup.confirm({
            template: template,
            buttons: [{
              text: cancelText || '取消',
              type: 'button-light',
              onTap: function(e) {
                isAleart = false;
                cancel instanceof Function && cancel();
              }
            }, {
              text: okText || '确定',
              type: 'button-light',
              onTap: function(e) {
                isAleart = false;
                ok instanceof Function && ok();
              }
            }]
          });
          // return function() {
          //   confirmPopup.close()
          //   isAleart = false;
          // }
        }
          setTimeout(function () {
              isAleart = false;
          },3000)
      },
      setCache: function($key, $value, $expire) {
        var object = {
          value: $value,
          timestamp: $expire && (parseInt($expire) + new Date().getTime()) || '0'
        };
        localStorage.setItem($key, JSON.stringify(object));
      },
      getCache: function($key) {
        var cache = localStorage.getItem($key);
        if (cache) {
          var object = JSON.parse(localStorage.getItem($key)),
            dateString = object.timestamp,
            now = new Date().getTime().toString();
          if (dateString != '0' && now > dateString) {
            localStorage.removeItem($key);
            return null;
          }
          return object.value;
        } else return null;
      },
      clearCache: function($key) {
        localStorage.removeItem($key);
      },
      logout: function() {
        $return.clearCache('Token');
        $return.clearCache('information');
        $return.clearCache('balanceNum');
        $return.clearCache('hasClickBalance');
        $return.clearCache('bankList');
        $return.clearCache('bannerImg');
        
        cordovaPlug.CommonPL(function(data) {}, "loginout", [])
      },
      //解析地址参数
      getQueryString: function(url, name) {
        var query = url.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          if (pair[0] == name) {
            return pair[1];
          }
        }
        return (false);
      },
      //生成uuid
      uuid: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },
      //获取设备id
      checkDevice: function() {
        if (isDebug) {
          var data = {
            "DeviceId": "test",
            "ClientId": "test",
            "deviceName": "test",
            "deviceVersion": "7.0.0"
          };
          app_url = debug_url;
          $return.setCache('getDeviceIdAndClientId', data);
          return;
        }

        if (!$return.getCache('getDeviceIdAndClientId')) {
          var baseData = {
            "DeviceId": $return.uuid(),
            "ClientId": "glLive.app.ios",
            "deviceName": "iPhone 10 Plus",
            "deviceVersion": "9.0.0"
          };
          $return.setCache('getDeviceIdAndClientId', baseData);
          cordovaPlug.CommonPL(function(data) {
            if (data.status == 1) {
              alert(angular.toJson(data.data))
              $return.setCache('getDeviceIdAndClientId', data.data);
            } else {
              toast.show("插件调用失败！");
            }
          }, "getDeviceIdAndClientId", [])
        }
        // }else{
        //   if($return.getCache('getDeviceIdAndClientId').deviceName == 'MI 2S' || $return.getCache('getDeviceIdAndClientId').deviceName == 'MI 5'){
        //          document.documentElement.style.fontSize = '41.7px';
        //   }
        //   if($return.getCache('getDeviceIdAndClientId').deviceName == 'm1 metal'){
        //     document.documentElement.style.fontSize = '51px';
        //   }
        // }
      },
      //获取定位
      checkLocation: function(success) {
        console.log("调用了定位地图");
        if (isDebug) {
          $rootScope.myCity = {
            "cityId": "77",
            "city": "深圳市",
            "address": "广东省深圳市南山区高新南一道9-南门",
            "latitude": "22.543544",
            "longitude": "113.959062",
            "streetName": "高新9道"
          }
        }
        cordovaPlug.CommonPL(function(data) {
          if (data.status == 1) {
            $rootScope.myCity = data.data;
            success instanceof Function && success(data.data);
          } else {
            toast.show("插件调用失败！");
          }
        }, "location", [])
      },
      //拉取webview微信支付
      wxplayOpen : function(url){
        cordovaPlug.CommonPL(function(data){
          if(data.status == 1){
            if(data.data.indexOf('status=2') == -1){
              window.location.href='#'+$scope.wxurl.split('#')[1];
            }
          }
        }, "weChatPay", [url])
      },
      //友盟自定义事件
      UMclickEvent : function(name){
        cordovaPlug.CommonPL(function(data){
          
        }, "clickEventStatistics", [name])
      },
      //获取签名
      checkSign: function(_string, mysuccess) {
        if (isDebug) {
          $http({
            method: 'get',
            url: app_url + "lifeAPI/getSign?text=" + _string,
          }).then(function success(sign) {
            var data = {
              "RSA": sign.data.data
            };
            mysuccess instanceof Function && mysuccess(data);
          }, function error() { //debug获取RSA失败，进入本地json调试模式
            var _data = {
              "RSA": ''
            };
            app_url = mock_url;
            mysuccess instanceof Function && mysuccess(_data);
          })
          return;
        }
        cordovaPlug.CommonPL(function(data) {
          if (data.status == 1) {
            mysuccess instanceof Function && mysuccess(data.data);
          } else {
            toast.show("插件调用失败！");
          }
        }, "getRSA", [_string])
      },
      //MD5加密算法
      checkMd5: function(_string, success) {
        if (isDebug) {
          var data = {
            'MD5': hex_md5(_string.toString())
          }
          success instanceof Function && success(data);
          return;
        }
        cordovaPlug.CommonPL(function(data) {
          if (data.status == 1) {
            success instanceof Function && success(data.data);
          } else {
            toast.show("插件调用失败！");
          }
        }, "getMD5", [_string])
      },
      checkscan: function() {
//      var url = "https://pay.365gl.com/quick/prod/wxpayh5/index.html#/wx_entry?type=1&merchantNo=1707671000128&userId=1703025200065153"; 
//            //打赏员工地址
//            $return.setCache('scanDate', url);
//            //不是quick的地址返回首页
//            var reg = url.match(/\.365gl\.com\/quick/);
//            // if (reg == null) {
//            //   $state.go('tab.index');
//            //   return
//            // }
//            //带qrcode的台账码扫描        
//            var barCodeReg = /\.365gl\.com.+qrcode=/.test(url),
//              barCode = '';
//            if (barCodeReg) {
//              url.split('&').forEach(function(v) {
//                var reg = /qrcode=(.+)/.exec(v)
//                if (reg && reg[1]) {
//                  barCode = reg[1]
//                }
//              })
//              if (barCode) {
//                $return.setCache('payScene', '2')
//                $state.go('tab.my_sweep', {
//                  merchantNo: barCode,
//                  operatorId: '',
//                  cash: ''
//                });
//              } else {
//                $state.go('tab.index');
//              }
//              return
//            }
//            //兼容微信和app取值
//            var reg_group = url.match(/\/groupPay/g);
//            var groupReg = url.split("?");
//            var regs = groupReg[groupReg.length-1].split("&");
//            if (reg_group != null) {
//              if (url.indexOf('type') != -1) {
//                var newgroupParam = {
//                  groupId: '', //群id
//                }
//                regs.forEach(function(v) {
//                  var d = v.split("=");
//                  newgroupParam[d[0]] = d[1]
//                })
//                $state.go('tab.group_pay_active', {
//                    type: newgroupParam.groupId,
//                    hash: new Date().getTime()
//                })
//                return;
//              }
//              $return.get('lifeAPI/groupManagement/rlAmountPro', {}, function(_data) {
//                var rlAmountPro = _data.data.countDownSec;
//                var groupParam = {
//                  groupId: '', //群id
//                  userId: '', //建群人的ID
//                  userName: '', //发起人
//                  totalAmount: '', //总金额
//                  rlAmount: '', //认领金额
//                  mainOrderNo: '', //主订单号
//                  merchantNo: '', //商户号
//                  glMerchantNo: '', //给乐订单号
//                  merchantName: '', //商户简称
//                  merchantImgUrl: '', //商户头像
//                  saleRate: '', //返豆率
//                  userType: '', // 0 -- 发起人，1==参与者
//                  url: url, //完整地址
//                  countDownSec: rlAmountPro * 1000 || 60000 //抽奖倒计时（毫秒）
//                }
//                regs.forEach(function(v) {
//                  var d = v.split("=");
//                  groupParam[d[0]] = d[1]
//                })
//                $return.post('lifeAPI/groupManagement/qrCodeInGroup', {
//                  "groupId": groupParam.groupId,
//                  "imgUrl": $return.getCache('information').photo || './img/df-u-img.png',
//                  "userId": $return.getCache("Token").userId,
//                  "userName": $return.getCache('information').realName,
//                  "apiVersion":"V1.1.0"
//                }, function(data) {
//                  groupParam.userName = data.data.groupOwnerName;
//                  groupParam.totalAmount = data.data.totalAmount;
//                  groupParam.rlAmount = data.data.rlAmount;
//                  groupParam.mainOrderNo = data.data.mainOrderNo;
//                  groupParam.merchantNo = data.data.merchantNo;
//                  groupParam.glMerchantNo = data.data.glMerchantNo;
//                  groupParam.merchantName = data.data.merchantName;
//                  groupParam.merchantImgUrl = data.data.merchantImgUrl;
//                  groupParam.userType = 1;
//                  $return.setCache(groupParam.groupId, groupParam)
//                  $state.go('tab.group_pay_start', {
//                    groupId: groupParam.groupId
//                  })
//                }, {}, 1)
//                return;
//              }, {})
//              return;
//            }
//            
//            var param = {
//              merchantNo: '',
//              operatorId: '',
//              cash: ''
//            }
//            regs.forEach(function(v) {
//              var d = v.split("=");
//              param[d[0]] = d[1]
//            })
//            console.log(param)
//            $return.setCache('payScene', '2')
//            $state.go('tab.my_sweep', param);
        console.log("成功调用扫一扫");
        
        // $state.go('tab.payment_exceptional',{money:'99',backRate:'10',merchantNo:'1000001000419'})
        cordovaPlug.CommonPL(function(data) {
          if (data.status == 1) {
            if (data.data.type == 1) {
              $state.go("tab.payment");
            } else if (data.data.type == 2) {
              //扫码地址
              var url = data.data.url; 
              //打赏员工地址
              $return.setCache('scanDate', url);
              //不是quick的地址返回首页
              var reg = url.match(/\.365gl\.com\/quick/);
              // if (reg == null) {
              //   $state.go('tab.index');
              //   return
              // }
              //带qrcode的台账码扫描        
              var barCodeReg = /\.365gl\.com.+qrcode=/.test(url),
                barCode = '';
              if (barCodeReg) {
                url.split('&').forEach(function(v) {
                  var reg = /qrcode=(.+)/.exec(v)
                  if (reg && reg[1]) {
                    barCode = reg[1]
                  }
                })
                if (barCode) {
                  $return.setCache('payScene', '2')
                  $state.go('tab.my_sweep', {
                    merchantNo: barCode,
                    operatorId: '',
                    cash: ''
                  });
                } else {
                  $state.go('tab.index');
                }
                return
              }
              //兼容微信和app取值
              var reg_group = url.match(/\/groupPay/g);
              var groupReg = url.split("?");
              var regs = groupReg[groupReg.length-1].split("&");
              if (reg_group != null) {
                if (url.indexOf('type') != -1) {
                  var newgroupParam = {
                    groupId: '', //群id
                  }
                  regs.forEach(function(v) {
                    var d = v.split("=");
                    newgroupParam[d[0]] = d[1]
                  })
                  $state.go('tab.group_pay_active', {
                      type: newgroupParam.groupId,
                      hash: new Date().getTime()
                  })
                  return;
                }
                $return.get('lifeAPI/groupManagement/rlAmountPro', {}, function(_data) {
                  var rlAmountPro = _data.data.countDownSec;
                  var groupParam = {
                    groupId: '', //群id
                    userId: '', //建群人的ID
                    userName: '', //发起人
                    totalAmount: '', //总金额
                    rlAmount: '', //认领金额
                    mainOrderNo: '', //主订单号
                    merchantNo: '', //商户号
                    glMerchantNo: '', //给乐订单号
                    merchantName: '', //商户简称
                    merchantImgUrl: '', //商户头像
                    saleRate: '', //返豆率
                    userType: '', // 0 -- 发起人，1==参与者
                    url: url, //完整地址
                    countDownSec: rlAmountPro * 1000 || 60000 //抽奖倒计时（毫秒）
                  }
                  regs.forEach(function(v) {
                    var d = v.split("=");
                    groupParam[d[0]] = d[1]
                  })
                  $return.post('lifeAPI/groupManagement/qrCodeInGroup', {
                    "groupId": groupParam.groupId,
                    "imgUrl": $return.getCache('information').photo || './img/df-u-img.png',
                    "userId": $return.getCache("Token").userId,
                    "userName": $return.getCache('information').realName,
                    "apiVersion":"V1.1.0"
                  }, function(data) {
                    groupParam.userName = data.data.groupOwnerName;
                    groupParam.totalAmount = data.data.totalAmount;
                    groupParam.rlAmount = data.data.rlAmount;
                    groupParam.mainOrderNo = data.data.mainOrderNo;
                    groupParam.merchantNo = data.data.merchantNo;
                    groupParam.glMerchantNo = data.data.glMerchantNo;
                    groupParam.merchantName = data.data.merchantName;
                    groupParam.merchantImgUrl = data.data.merchantImgUrl;
                    groupParam.userType = 1;
                    $return.setCache(groupParam.groupId, groupParam)
                    $state.go('tab.group_pay_start', {
                      groupId: groupParam.groupId
                    })
                  }, {}, 1)
                  return;
                }, {})
                return;
              }
              
              var param = {
                merchantNo: '',
                operatorId: '',
                cash: ''
              }
              regs.forEach(function(v) {
                var d = v.split("=");
                param[d[0]] = d[1]
              })
              $return.setCache('payScene', '2')
              $state.go('tab.my_sweep', param);
            } else {
              console.log("后台自行处理")
            }
          } else {
            toast.show("插件调用失败！");
          }
        }, "scan", ["1"])
      },
      //MD5+RSA登录专用
      loginEncrypt: function(_string, _md5, success) {
        cordovaPlug.CommonPL(function(data) {
          if (data.status == 1) {
            success instanceof Function && success(data.data);
          } else {
            toast.show("插件调用失败！");
          }
        }, "loginEncrypt", [_string, _md5])
      },
      //判断用户是否登录
      isLogin: function() {
        if ($return.getCache('Token') == null) {
          $state.go("tab.tab_login");
          return false;
        } else return true;
      },
      //判断用户是否有开启网络
      isnetwork: function() {
        // cordovaPlug.CommonPL(function(data){
        //    if(data.status == 1){
        //         alert(data.isConnected == true)
        //         return data.isConnected == true;
        //    }else{
        //         toast.show("插件调用失败！");
        //    }
        // },"isNetworkConnected",[])
        if (navigator.onLine) return true;
        else return false;
      },
      isNetwordConnected: function(bak) {
        cordovaPlug.CommonPL(function(data) {
          if (typeof data != "object") data = JSON.parse(data);
          if (data.status == 1) {
            if (data.data.isConnected == "true" || data.data.isConnected == true) {
              bak()
            } else {
              $return.showAlert('温馨提示', "无法连接网络，请检查WIFI或移动数据网络是否正常");
            }
          } else {
            toast.show("插件调用失败！");
          }
        }, "isNetworkConnected", [])
      },
      showEffect: function(list, time, success, num) {
        console.log(list)
        success instanceof Function && success(list);
        // var _num = list.length < num ? list.length : num;
        // for (var i = 0; i < _num; i++) {
        //     (function(i){
        //         $timeout(function () {
        //             success instanceof Function && success(list[i]);
        //         }, time * i);
        //     })(i)
        // };  
      },
      post_login: function(url, data, success, error, loading) {
        if (!isDebug) {
          cordovaPlug.CommonPL(function(data) {
	          if (typeof data != "object") data = JSON.parse(data);
	          if (data.status == 1) {
	            if (data.data.isConnected == "true" || data.data.isConnected == true) {} 
	            else {
	              $return.showAlert('温馨提示', "无法连接网络，请检查WIFI或移动数据网络是否正常");
	              return;
	            }
	          } else {
	            toast.show("插件调用失败！");
	          }
	        }, "isNetworkConnected", [])
        }
        $return.showLoading();
        var myDevice = $return.getCache('getDeviceIdAndClientId'),
          myTime = Math.floor(new Date().getTime() / 1000);
        if (!myDevice) return;
        console.time('请求时间：');
        if (isDebug) {
          var myMD5 = hex_md5("GL_SALT_MD5_KEY" + data.password.toString());
          $http({
            method: 'get',
            url: app_url + "lifeAPI/getSign?text=" + myDevice.DeviceId.toString() + myDevice.ClientId.toString() + ClientVer.toString() + myTime.toString() + data.username.toString() + myMD5,
          }).then(function success(sign) {
            var _data = {};
            _data.RSA = sign.data.data;
            _data.MD5 = myMD5;
            newHttp(_data);
          }, {})
          return;
        }
        $return.loginEncrypt(myDevice.DeviceId.toString() + myDevice.ClientId.toString() + ClientVer.toString() + myTime.toString() + data.username.toString(),
          "GL_SALT_MD5_KEY" + data.password.toString(),
          function(dataAll) {
            newHttp(dataAll)
          });

        function newHttp(_data) {
          data.password = _data.MD5;
          $http({
            method: 'post',
            url: app_url + url,
            data: data,
            headers: {
              "GL_DEVICE_ID": myDevice.DeviceId,
              "GL_CLIENT_ID": myDevice.ClientId,
              "GL_CLIENT_VER": ClientVer,
              "GL_TIMESTAMP": myTime,
              "GL_REQ_SIGN": _data.RSA
            },
            timeout: url_overtime
          }).then(function successCallback(data) {
            console.timeEnd('请求时间：');
            data = data.data;
            if (data.result == "000000") success instanceof Function && success(data);
            else if (data.result == "100004") {
              toast.show('当前设备为新设备，需要短信验证码确认！')
              $return.hideLoading();
              $timeout(function() {
                $state.go("tab.tab_loginByCode");
              }, 1500)
            } else $return.showAlert('温馨提示', data.description);
            $return.hideLoading();
          }, function errorCallback(data) {
            $return.hideLoading();
            data && data.description ? $return.showAlert('温馨提示', data.description) : $return.showAlert('温馨提示', "网络连接错误，请稍后再试！");
            error instanceof Function && error(data);

          });
        }
      },
      get: function(url, data, success, error, loading) {
        if (!isDebug) {
          cordovaPlug.CommonPL(function(data) {
	          if (typeof data != "object") data = JSON.parse(data);
	          if (data.status == 1) {
	            if (data.data.isConnected == "true" || data.data.isConnected == true) {} 
	            else {
	              $return.showAlert('温馨提示', "无法连接网络，请检查WIFI或移动数据网络是否正常");
	              return;
	            }
	          } else {
	            toast.show("插件调用失败！");
	          }
	        }, "isNetworkConnected", [])
        }
        if (loading != undefined) $return.showLoading();
        var myDevice = $return.getCache('getDeviceIdAndClientId'),
          myTime = Math.floor(new Date().getTime() / 1000),
          myToken = '';
        if (!myDevice) return;
        console.time('请求时间：');
        data = data instanceof Object && data || {};
        if ($return.getCache('Token') != null) myToken = $return.getCache('Token').token;

        $return.checkSign(myToken + myDevice.DeviceId.toString() + myDevice.ClientId.toString() + ClientVer.toString() + myTime.toString(),
          function(_data) {
            newHttp(_data);
          });

        function newHttp(_data) {
          $http({
            method: 'get',
            url: app_url + url,
            params: data,
            headers: {
              "GL_TOKEN": myToken,
              "GL_DEVICE_ID": myDevice.DeviceId,
              "GL_CLIENT_ID": myDevice.ClientId,
              "GL_CLIENT_VER": ClientVer,
              "GL_TIMESTAMP": myTime,
              "GL_REQ_SIGN": _data.RSA,
              'Cache-Control': 'max-age=1000'
            },
            timeout: url_overtime
          }).then(function successCallback(data) {
            console.timeEnd('请求时间：');
            data = data.data;
            if (data.result == "000000") success instanceof Function && success(data);
            else if (data.result == "c_forced_login") {
              $return.logout();
              $return.showConfirm('温馨提醒', data.description, function() {
                $state.go("tab.tab_login");
              }, function() {
                $state.go("tab.index");
              }, '确定', '取消')
              try {
                actionSheetItem.close();
              } catch (e) {}
            }
            else if (data.result == "000001") {
              $return.logout();
              $return.showConfirm('温馨提醒', '登录失效，请重新登录', function() {

                $state.go("tab.tab_login");
              }, function() {
                $return.logout();
                $state.go("tab.index");
              }, '确定', '取消')
              try {
                actionSheetItem.close();
              } catch (e) {}
            } else if (data.result == "700017") {
                $return.showAlert('温馨提示', data.description, function() {
                    $state.go("tab.index");
                });
            } else if(data.result == "KF0001"){
                $return.showConfirm('',data.description,function(){
                  cordovaPlug.CommonPL(function() {
                    //隐藏拨打弹框
                  }, "telephone", ['4000200365'])
                },{},'客服电话','我知道了')
            } else {
              $return.showAlert('温馨提示', data.description, function() {
                $return.hideLoading();
              });
            }
            if (loading != undefined) $return.hideLoading();
          }, function errorCallback(data) {
            if (loading != undefined) $return.hideLoading();
            data && data.description ? $return.showAlert('温馨提示', data.description) : $return.showAlert('温馨提示', "网络连接错误，请稍后再试！");
            error instanceof Function && error(data);
          });
        }
      },
      post_pay: function(url, data, success, passwordFunc, error, payError, loading) {
        if (!isDebug) {
          cordovaPlug.CommonPL(function(data) {
	          if (typeof data != "object") data = JSON.parse(data);
	          if (data.status == 1) {
	            if (data.data.isConnected == "true" || data.data.isConnected == true) {} 
	            else {
	              $return.showAlert('温馨提示', "无法连接网络，请检查WIFI或移动数据网络是否正常");
	              return;
	            }
	          } else {
	            toast.show("插件调用失败！");
	          }
	        }, "isNetworkConnected", [])
        }
        if (loading != undefined) $return.showLoading(30000);
        var myDevice = $return.getCache('getDeviceIdAndClientId'),
          myTime = Math.floor(new Date().getTime() / 1000),
          myToken = '';
        if (!myDevice) return;
        console.time('请求时间：');
        data = data instanceof Object && data || {};
        if ($return.getCache('Token') != null) myToken = $return.getCache('Token').token;
        $return.checkSign(myToken + myDevice.DeviceId.toString() + myDevice.ClientId.toString() + ClientVer.toString() + myTime.toString(),
          function(_data) {
            newHttp(_data);
          });

        function newHttp(_data) {
          $http({
            method: 'post',
            url: app_url + url,
            data: data,
            headers: {
              "GL_TOKEN": myToken,
              "GL_DEVICE_ID": myDevice.DeviceId,
              "GL_CLIENT_ID": myDevice.ClientId,
              "GL_CLIENT_VER": ClientVer,
              "GL_TIMESTAMP": myTime,
              "GL_REQ_SIGN": _data.RSA
            },
            timeout: 60000
          }).then(function successCallback(data) {
            console.timeEnd('请求时间：');
            data = data.data;
            //data.result = "300019"
            if (data.result === "000000") {
              success instanceof Function && success(data);
              $return.hideLoading();
            } else if (data.result === "300019" || data.result === "000099") {
              //这两个返回码要去做轮询操作，不给弹窗提示
              error instanceof Function && error(data);
            } else if (data.result === "300022") {
              $return.hideLoading();
              passwordFunc instanceof Function && passwordFunc(data);
            } else {
              $return.hideLoading();
              if (data.result === "300025" || data.result === "300026" || data.result === "300027" || data.result === "300028" || data.result === "300029" || data.result === "300030" || data.result === "300031" || data.result === "300032" || data.result === "300033" || data.result === "300011") {
                payError instanceof Function && payError(data);
              } else {
                $return.showAlert('温馨提示', data.description, function() {
                  $return.hideLoading();
                });
              }
            }
          }, function errorCallback(data) {
            $return.hideLoading();
            error instanceof Function && error(data);
          });
        }
      },
      sendMessage: function(phoneNo, businessType, success, error) {
        if (!isDebug) {
          cordovaPlug.CommonPL(function(data) {
	          if (typeof data != "object") data = JSON.parse(data);
	          if (data.status == 1) {
	            if (data.data.isConnected == "true" || data.data.isConnected == true) {} 
	            else {
	              $return.showAlert('温馨提示', "无法连接网络，请检查WIFI或移动数据网络是否正常");
	              return;
	            }
	          } else {
	            toast.show("插件调用失败！");
	          }
	        }, "isNetworkConnected", [])
        }
        var myDevice = $return.getCache('getDeviceIdAndClientId'),
          myTime = Math.floor(new Date().getTime() / 1000),
          myToken = '';
        if (!myDevice) return;
        console.time('请求时间：');
        if ($return.getCache('Token') != null) myToken = $return.getCache('Token').token;
        $return.checkSign(myToken + myDevice.DeviceId.toString() + myDevice.ClientId.toString() + ClientVer.toString() + myTime.toString(),
          function(_data) {
            newHttp(_data);
          });

        function newHttp(_data) {
          $http({
            method: 'post',
            url: app_url + 'lifeAPI/sms/sendSms',
            data: {
              "phoneNo": phoneNo,
              "businessType": businessType
            },
            headers: {
              "GL_TOKEN": myToken,
              "GL_DEVICE_ID": myDevice.DeviceId,
              "GL_CLIENT_ID": myDevice.ClientId,
              "GL_CLIENT_VER": ClientVer,
              "GL_TIMESTAMP": myTime,
              "GL_REQ_SIGN": _data.RSA
            },
            timeout: url_overtime
          }).then(function successCallback(data) {
            console.timeEnd('请求时间：');
            data = data.data;
            if (data.result == "000000") success instanceof Function && success(data);
            else $return.showAlert('温馨提示', data.description);
          }, function errorCallback(data) {
            data && data.description ? $return.showAlert('温馨提示', data.description) : $return.showAlert('温馨提示', "网络连接错误，请稍后再试！");
            error instanceof Function && error(data);
          });
        }
      },
      post: function(url, data, success, error, loading, noSuccess, payError) {
        if (!isDebug) {
          cordovaPlug.CommonPL(function(data) {
	          if (typeof data != "object") data = JSON.parse(data);
	          if (data.status == 1) {
	            if (data.data.isConnected == "true" || data.data.isConnected == true) {} 
	            else {
	              $return.showAlert('温馨提示', "无法连接网络，请检查WIFI或移动数据网络是否正常");
	              return;
	            }
	          } else {
	            toast.show("插件调用失败！");
	          }
	        }, "isNetworkConnected", [])
        }
        if (loading != undefined) $return.showLoading();
        var myDevice = $return.getCache('getDeviceIdAndClientId'),
          myTime = Math.floor(new Date().getTime() / 1000),
          myToken = '';
        if (!myDevice) return;
        console.time('请求时间：');
        data = data instanceof Object && data || {};
        if ($return.getCache('Token') != null) myToken = $return.getCache('Token').token;
        $return.checkSign(myToken + myDevice.DeviceId.toString() + myDevice.ClientId.toString() + ClientVer.toString() + myTime.toString(),
          function(_data) {
            newHttp(_data);
          });

        function newHttp(_data) {
          $http({
            method: 'post',
            url: app_url + url,
            data: data,
            headers: {
              "GL_TOKEN": myToken,
              "GL_DEVICE_ID": myDevice.DeviceId,
              "GL_CLIENT_ID": myDevice.ClientId,
              "GL_CLIENT_VER": ClientVer,
              "GL_TIMESTAMP": myTime,
              "GL_REQ_SIGN": _data.RSA
            },
            timeout: url_overtime
          }).then(function successCallback(data) {
            console.timeEnd('请求时间：');
            data = data.data;
            if (noSuccess != undefined) noSuccess instanceof Function && noSuccess(data);
            else if (data.result == "000000") success instanceof Function && success(data);
            else if (data.result == "000001") {
              $return.logout();
              $return.showConfirm('温馨提醒', '登录失效，请重新登录', function() {

                $state.go("tab.tab_login");
              }, function() {
                $state.go("tab.index");
              }, '确定', '取消')
            } else if (data.result == "700017") {
                $return.showAlert('温馨提示', data.description, function() {
                    $state.go("tab.index");
                });
            }else if(data.result == "KF0001"){
                $return.showConfirm('',data.description,function(){
                  cordovaPlug.CommonPL(function() {
                    //隐藏拨打弹框
                  }, "telephone", ['4000200365'])
                },{},'客服电话','我知道了')
            } else $return.showAlert('温馨提示', data.description, function() {
                if (payError != undefined) payError instanceof Function && payError(data);
                $return.hideLoading();
            });
            if (loading != undefined) $return.hideLoading();
          }, function errorCallback(data) {
            if (loading != undefined) $return.hideLoading();
            data && data.description ? $return.showAlert('温馨提示', data.description) : $return.showAlert('温馨提示', "网络连接错误，请稍后再试！");
            error instanceof Function && error(data);
          });
        }
      },
      delete: function(url, data, success, error, loading) {
        if (!isDebug) {
          cordovaPlug.CommonPL(function(data) {
	          if (typeof data != "object") data = JSON.parse(data);
	          if (data.status == 1) {
	            if (data.data.isConnected == "true" || data.data.isConnected == true) {} 
	            else {
	              $return.showAlert('温馨提示', "无法连接网络，请检查WIFI或移动数据网络是否正常");
	              return;
	            }
	          } else {
	            toast.show("插件调用失败！");
	          }
	        }, "isNetworkConnected", [])
        }
        if (loading != undefined) $return.showLoading();
        var myDevice = $return.getCache('getDeviceIdAndClientId'),
          myTime = Math.floor(new Date().getTime() / 1000),
          myToken = '';
        if (!myDevice) return;
        console.time('请求时间：');
        data = data instanceof Object && data || {};
        if ($return.getCache('Token') != null) myToken = $return.getCache('Token').token;
        $return.checkSign(myToken + myDevice.DeviceId.toString() + myDevice.ClientId.toString() + ClientVer.toString() + myTime.toString(),
          function(_data) {
            newHttp(_data);
          });

        function newHttp(_data) {
          $http({
            method: 'delete',
            url: app_url + url,
            params: data,
            headers: {
              "GL_TOKEN": myToken,
              "GL_DEVICE_ID": myDevice.DeviceId,
              "GL_CLIENT_ID": myDevice.ClientId,
              "GL_CLIENT_VER": ClientVer,
              "GL_TIMESTAMP": myTime,
              "GL_REQ_SIGN": _data.RSA
            },
            timeout: url_overtime
          }).then(function successCallback(data) {
            console.timeEnd('请求时间：');
            data = data.data;
            if (data.result == "000000") success instanceof Function && success(data);
            else if (data.result == "000001") {
              $return.logout();
              $return.showConfirm('温馨提醒', '登录失效，请重新登录', function() {
                $state.go("tab.tab_login");
              }, function() {
                $state.go("tab.index");
              }, '确定', '取消')
            } else $return.showAlert('温馨提示', data.description);
            if (loading != undefined) $return.hideLoading();
          }, function errorCallback(data) {
            if (loading != undefined) $return.hideLoading();
            data && data.description ? $return.showAlert('温馨提示', data.description) : $return.showAlert('温馨提示', "网络连接错误，请稍后再试！");
            error instanceof Function && error(data);
          });
        }
      },
      put: function(url, data, success, error, loading, noSuccess) {
        if (!isDebug) {
          cordovaPlug.CommonPL(function(data) {
	          if (typeof data != "object") data = JSON.parse(data);
	          if (data.status == 1) {
	            if (data.data.isConnected == "true" || data.data.isConnected == true) {} 
	            else {
	              $return.showAlert('温馨提示', "无法连接网络，请检查WIFI或移动数据网络是否正常");
	              return;
	            }
	          } else {
	            toast.show("插件调用失败！");
	          }
	        }, "isNetworkConnected", [])
        }
        if (loading != undefined) $return.showLoading();
        var myDevice = $return.getCache('getDeviceIdAndClientId'),
          myTime = Math.floor(new Date().getTime() / 1000),
          myToken = '';
        if (!myDevice) return;
        console.time('请求时间：');
        data = data instanceof Object && data || {};
        if ($return.getCache('Token') != null) myToken = $return.getCache('Token').token;
        $return.checkSign(myToken + myDevice.DeviceId.toString() + myDevice.ClientId.toString() + ClientVer.toString() + myTime.toString(),
          function(_data) {
            newHttp(_data);
          });

        function newHttp(_data) {
          $http({
            method: 'put',
            url: app_url + url,
            data: data,
            headers: {
              "GL_TOKEN": myToken,
              "GL_DEVICE_ID": myDevice.DeviceId,
              "GL_CLIENT_ID": myDevice.ClientId,
              "GL_CLIENT_VER": ClientVer,
              "GL_TIMESTAMP": myTime,
              "GL_REQ_SIGN": _data.RSA
            },
            timeout: url_overtime
          }).then(function successCallback(data) {
            console.timeEnd('请求时间：');
            data = data.data;
            /*处理原密码修改错误时***/
            if (noSuccess != undefined) noSuccess instanceof Function && noSuccess(data);
            /*处理原密码修改错误时***/

            else if (data.result == "000000") success instanceof Function && success(data);
            else if (data.result == "000001") {
              $return.logout();
              $return.showConfirm('温馨提醒', '登录失效，请重新登录', function() {
                $state.go("tab.tab_login");
              }, function() {
                $state.go("tab.index");
              }, '确定', '取消')
            } else $return.showAlert('温馨提示', data.description);
            if (loading != undefined) $return.hideLoading();
          }, function errorCallback(data) {
            if (loading != undefined) $return.hideLoading();
            data && data.description ? $return.showAlert('温馨提示', data.description) : $return.showAlert('温馨提示', "网络连接错误，请稍后再试！");
            error instanceof Function && error(data);
          });
        }
      }
    }
    return $return;
  })
  .factory('bindCardService', function(toast, Common, $http, $httpParamSerializerJQLike, cordovaPlug, $timeout, $location) {
    var registerData, bindCardData, registerDataActionUrl, bindCardDataActionUrl;

    function postfft(url, fftData, title) {
      $http({
        method: 'post',
        url: url,
        // pass in data as strings
        data: $httpParamSerializerJQLike(fftData),
        // set the headers so angular passing info as form data (not request payload)
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      }).then(function successCallback(response) {

        $http(getFormInfo(response.data)).then(function(data) {
          if (typeof data.data == 'string') {
            // console.log(data)
            // var iframe = document.createElement('iframe');
            // var content = document.getElementById('banklist');
            // iframe.style.width = '100%';
            // iframe.style.height = '100%';
            // iframe.style.position = 'top';
            // iframe.style.top = '0';
            // iframe.setAttribute('srcdoc', response.data);
            //
            // content.appendChild(iframe)
            cordovaPlug.CommonPL(function() {

            }, 'openUsr', [data.data, title]);
          } else {
            Common.hideLoading();
            toast.show("服务器繁忙，请稍后再试");
          }
        }, function() {
          Common.hideLoading();
          toast.show("服务器繁忙，请稍后再试");
        });
      }, function errorCallback(response) {
        Common.hideLoading();
        toast.show("服务器繁忙，请稍后再试");
      });
    }

    window.closeWebView = function() {
      Common.hideLoading();
      if ($location.path().indexOf('/tab/payment_comfirmReward') != -1) {
        Common.showConfirm("温馨提醒", "打赏功能目前不支持信用卡！", function() {
          //跳转到绑卡
          bindCardService.fft(function() {
            getBankList(1);
          });
        }, function() {
          $state.go('tab.index');
        }, "去绑卡", "回首页");
      }
    }

    function getFormInfo(html) {
      var areg = html.match(/(<input[^><]+>?)/g);
      var preg = html.match(/action="([^"]+)"\s+method="([^"]+)"/);
      // match(/(\<input[^<>]+name="([^<>]+)".+value="([^<>]+)"[^<>]*\>?)/g);
      if (preg[2].toLowerCase() == 'post') {
        var obj = {
          url: preg[1],
          method: preg[2],
          data: {},
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };
        areg.forEach(function(element, index) {
          var reg = element.match(/<input.+name="(.+)".+value="(.+)".*>/);

          obj.data[reg[1]] = reg[2];

        });
        obj.data = $httpParamSerializerJQLike(obj.data);
      } else {
        var obj = {
          url: preg[1],
          method: preg[2],
          params: {},
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };
        areg.forEach(function(element, index) {
          var reg = element.match(/<input.+name="(.+)".+value="(.+)".*>/);

          obj.params[reg[1]] = reg[2];

        });
      }
      return obj;
    }

    $bindCardService = {
      fft: function(cb) {
        Common.showLoading();
        $timeout(function() {
          Common.hideLoading();
        }, 10000)
        Common.get('lifeAPI/payment/fft/bindCard/token', null, function(res) {

          //获取并初始化数据
          registerData = res.data.registerData;
          bindCardData = res.data.bindCardData;

          if (!registerData && !bindCardData) {
            toast.show('获取绑卡信息失败，请稍后再试');
            return;
          }

          //获取到绑卡信息或者开户信息才走下面流程
          if (registerData) {
            registerDataActionUrl = registerData.actionUrl;
            delete registerData.actionUrl;
            //定义app回调H5获取绑卡页面全区func
            window.cb4bindCard = function(status) {

              if (status == 1) {
                bindCardDataActionUrl = bindCardData.actionUrl;
                delete bindCardData.actionUrl;
                $http({
                  method: 'post',
                  url: bindCardDataActionUrl,
                  // pass in data as strings
                  data: $httpParamSerializerJQLike(bindCardData),
                  // set the headers so angular passing info as form data (not request payload)
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                  }
                }).then(function successCallback(response) {
                  //定义绑卡完成全局func，调用service的时候传入
                  window.cb4fftFinished = function(cbstatus) {
                    if (cbstatus == 1) {
                      Common.get('lifeAPI/payment/fft/card/', {
                        'type': 1
                      }, function(data) {
                        var myData = Common.getCache('banklistColor').data;
                        var oldData = data.data;
                        for (var i = 0; i < oldData.length; i++) {
                          if (myData[oldData[i].bankIndex] == null) continue;
                          oldData[i].bankImg = 'img/bank/' + myData[oldData[i].bankIndex].icon;
                          oldData[i].color = myData[oldData[i].bankIndex].color;
                        }

                        Common.setCache("bankList", oldData);
                        if (cb) {
                          cb();
                        }
                      }, {}, 1);
                    } else {
                      Common.hideLoading();
                      Common.showAlert('温馨提示', '绑卡失败')
                    }
                  };

                  $http(getFormInfo(response.data)).then(function(data) {
                    cordovaPlug.CommonPL(function() {

                    }, 'bindCard', [data.data, '绑卡']);
                  });
                }, function errorCallback(response) {
                  Common.hideLoading();
                  toast.show("服务器繁忙，请稍后再试");
                });
              } else {
                toast.show('服务器繁忙，请稍后再试');
              }
            };

            //请求付费通获取html丢给app
            postfft(registerDataActionUrl, registerData, '设置支付密码');
          } else {
            bindCardDataActionUrl = bindCardData.actionUrl;
            delete bindCardData.actionUrl;
            //定义绑卡完成全局func，调用service的时候传入cb
            window.cb4fftFinished = function(cbstatus) {
              if (cbstatus == 1) {
                Common.get('lifeAPI/payment/fft/card/', {
                  'type': 1
                }, function(data) {
                  var myData = Common.getCache('banklistColor').data;
                  var oldData = data.data;
                  for (var i = 0; i < oldData.length; i++) {
                    if (myData[oldData[i].bankIndex] == null) continue;
                    oldData[i].bankImg = 'img/bank/' + myData[oldData[i].bankIndex].icon;
                    oldData[i].color = myData[oldData[i].bankIndex].color;
                  }
                  Common.setCache("bankList", oldData);
                  if (cb) {
                    cb();
                  }
                }, {}, 1);
              } else {
                Common.hideLoading();
                Common.showAlert('温馨提示', '绑卡失败');
              }
            };

            //请求付费通获取html丢给app
            postfft(bindCardDataActionUrl, bindCardData, '绑卡');

          }

        });
      }
    };
    return $bindCardService;
  })
  .factory('actionSheetItem', function($document, $compile, $rootScope, $timeout, $http, $templateCache, $state, cordovaPlug,$ionicModal) {
    var body = $document.find('body'),
      container

    function close() {
      container.removeClass('active')
      $timeout(function() {
        container.remove()
      }, 250)
    }

    function show(bak) {
      $timeout(function() {
        container.addClass('active')
        if (bak) bak(container)
      }, 50)
    }
    /*
     * 举报
     * confirmButton  确认文字
     * confirm 成功回调函数
     * cancel 取消回调函数
     * items 选项列表
     * */
    function showChoose(option) {
      var items = option.items,
        chooseItem = [],
        confirmButton = option.confirmButton ? option.confirmButton : '确认';
      container = angular.element('<div id="tab_store_action-sheet-container"></div>')
      body.append(container);

      var $scope = $rootScope.$new();
      $scope.choose = function() {
        container.removeClass('active')
        $timeout(function() {
          container.remove()
        }, 250)
        if (option.confirm) option.confirm(chooseItem)
      }
      $scope.select = function(i, e) {
        if (angular.element(e.target).hasClass('selected')) {
          angular.element(e.target).removeClass('selected')
          chooseItem.splice(chooseItem.indexOf(i), 1)
        } else {
          angular.element(e.target).addClass('selected')
          chooseItem.push(i)
        }
      }
      $scope.cancel = function(i, e) {
        close()
        if (option.cancel) option.cancel(chooseItem)
      }

      var html = '<div><div class="bg" ng-click="cancel()"></div><div class="box"><div class="items-box">'
      for (var i = 0; i < items.length; i++) {
        html += '<span ng-click="select(' + i + ',$event)">' + items[i] + '</span>'
      }
      html += '</div><div class="options"><a class="confirm" href="javascript:void(0)" ng-click="choose()">' + confirmButton + '</a></div></div></div>'
      html = $compile(html)($scope);
      container.append(html)
      show()
    }
    //显示电话号码 tel 电话号码
    function showTel(tel) {
      container = angular.element('<div id="tab_store_action-sheet-container"></div>')
      body.append(container);
      var $scope = $rootScope.$new();
      $scope.cancel = function(i, e) {
        close()
      }
      $scope.call = function(i, e) {
        cordovaPlug.CommonPL(function() {
          //隐藏拨打弹框
        }, "telephone", [tel])
        close()
      }
      var html = '<div><div class="bg" ng-click="cancel()"></div><div class="box tel-box"><div class="items-box">'
      html += '<span ng-click="call()">' + tel + '</span>'
      html += '</div><div class="options">' +
        '<a class="cancel" href="javascript:void(0)" ng-click="cancel()">取消</a></div></div></div>'
      html = $compile(html)($scope);
      container.append(html)
      show()
    }
    //显示支付完成页面
    function successPay(_num) {
      container = angular.element('<div id="tab_store_action-sheet-container"></div>')
      body.append(container);
      var $scope = $rootScope.$new();
      $scope.cancel = function(i, e) {
        close()
      }
      $scope.call = function(i, e) {
        close();
      }
      var html = '<div ng-click="call()"><div class="bg" ng-click="call()"></div><div class="popbox cjc_paybg"><img src="img/pay/close-btn.png" style="position: absolute;width: 0.8rem;height: 0.8rem;top:7.4rem;" alt=""><img src="img/hdqImg/@2xweep.png" alt=""><div class="cjc_pay_tip"><div class="colorff f32 tc">支付成功，您己获得' + _num + '乐豆</div><div class="tc f24 colorff cjc_pay_moretip">乐豆可在任何合作商店消费相当于' + _num + '元现金</div></div></div></div>'
      html = $compile(html)($scope);
      container.append(html)
      show()
    }
    //显示银行卡更换
    function changeBank(data, index, success) {
      container = angular.element('<div id="tab_store_action-sheet-container"></div>')
      body.append(container);
      var $scope = $rootScope.$new();
      $scope.cancel = function(i, e) {
        close()
      }
      $scope.serverSideChange = function(e) {
        success instanceof Function && success(e);
        close();
      }
      $scope.data = data;
      $scope.index = index;
      var html = '<div><div class="bg" ng-click="cancel()"></div><div class="box bankBox p0-24">'
      html += '<div class="cjc_bank_title bor-bot">选择优先支付方式</div><div class="cjc_bank_tip">优先使用所选支付方式付款，如付款失败将尝试使用其他支付方式完成付款</div>';
      html += '<div class="banklist"><ion-radio ng-repeat="item in data"  class="cjc_banklist f32 color33 bor-bot"  ' +
        'ng-value="item.value" ng-click="serverSideChange(item)" ' +
        'ng-if="item.color != undefined" ng-class="{true:\'active\',false:\'\'}[index==item.cardIndex]"> <img ng-src="{{item.bankImg}}" ' +
        'alt=""><span>{{item.bankName}}</span><span>{{item.cardType =="C" && " 信用卡" || " 储蓄卡"}}</span>' +
        ' <span>({{item.cardNo.substr(-4,4)}})</span></ion-radio><div class="cjc_height"></div></div></div>'
      html = $compile(html)($scope);
      container.append(html)
      show()
    }
    //暂停使用二维码弹框
    function showMadal(instructions, stopfunction) {
      container = angular.element('<div id="tab_store_action-sheet-container"></div>')
      body.append(container);
      var $scope = $rootScope.$new();
      $scope.cancel = function(i, e) {
        close()
      }
      $scope.stop = function(i, e) {
        stopfunction instanceof Function && stopfunction();
        close()
      }
      $scope.call = function(i, e) {
        instructions instanceof Function && instructions();
        close()
      }
      var html = '<div><div class="bg" ng-click="cancel()"></div><div class="box tel-box"><div class="items-box" ng-click="call()">'
      html += '<span style="color:#333;">使用说明</span></div><div class="items-box" ng-click="stop()"><span>暂停使用</span></div>'
      html += '<div class="options" ng-click="cancel()">' +
        '<a class="cancel" href="javascript:void(0)">取消</a></div></div></div>'
      html = $compile(html)($scope);
      container.append(html)
      show()
    }
    //显示未实名认证的
    function showAuthentication(init) {
      container = angular.element('<div id="tab_store_action-sheet-container"></div>')
      body.append(container);
      var $scope = $rootScope.$new();
      $scope.cancel = function(i, e) {
        close()
      }
      $scope.gotoCertification = function(i, e) {
        init instanceof Function && init();
        close()
      }
      var html = '<div class="bg" ng-click="cancel()"></div>'
      html += '<div class="cjc_showalert f28 box"><div class="cjc_alert_padding"><p class="success_1 bor-bot">完善资料<span ng-click="cancel()" class="err_img2"><i class="icon ion-close-round"></i></span></p> <div class="color66">尊敬的用户，为了您更好的体验给乐生活，请先去完成实名认证！</div></div><div class="df"><div class="df1" ng-click="gotoCertification()">马 上 认 证</div></div>'
      html = $compile(html)($scope);
      container.append(html)
      show();
    }
    /*
     * 仿madal弹框
     * scope 作用域
     * templateUrl 模板地址
     * template  模板文本
     * success  插入好回调函数，参数：container(插入的节点对象)
     * */
    function showPage(option) {
      var html = angular.element('<div class="box page-box"></div>')
      container = angular.element('<div id="tab_store_action-sheet-container"></div>')
      body.append(container);
      container.append(html);
      option.scope.cancel = function(i, e) {
        close()
        option.scope.closeModal()
      }
      if (option.template) {
        var page = $compile(option.template)(option.scope);
        html.append(page)
        show(option.success)
        return
      }
      $http.get(option.templateUrl, {
          cache: $templateCache
        })
        .then(function(response) {
          var page = $compile(response.data)(option.scope);
          html.append(page)
          show(option.success)

        });


    }


    return {
      showChoose: showChoose,
      showTel: showTel,
      showPage: showPage,
      showMadal: showMadal,
      showAuthentication: showAuthentication,
      changeBank: changeBank,
      successPay: successPay,
      close: close
    }
  })
  .directive('uiCheckSref', function($state, Common, commonConfigsJson) {
    return {
      restrict: 'A',
      require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
      link: function(scope, element, $attr, uiSrefActive) {
        var ref = parseStateRef($attr['uiCheckSref']),
          state = ref.state,
          param = scope.$eval(ref.paramExpr)
        if (ref.paramExpr) {
          scope.$watch(ref.paramExpr, function(val$$1) {
            param = val$$1;
          }, true);
        }

        function parseStateRef(ref) {
          var paramsOnly = ref.match(/^\s*({[^}]*})\s*$/),
            parsed;
          if (paramsOnly)
            ref = '(' + paramsOnly[1] + ')';
          parsed = ref.replace(/\n/g, " ").match(/^\s*([^(]*?)\s*(\((.*)\))?\s*$/);
          if (!parsed || parsed.length !== 4)
            throw new Error("Invalid state ref '" + ref + "'");
          return {
            state: parsed[1] || null,
            paramExpr: parsed[3] || null
          };
        }
        element.on('click', function() {
          console.log(Common.isDebug)
          if (!commonConfigsJson.isApp || Common.isDebug) {
            $state.go(state, param);
            return
          }
          Common.isNetwordConnected(function() {
            $state.go(state, param);
          })
        })
      }
    }
  })