var tab_login_myConfig = function($stateProvider) {
  $stateProvider
    .state('tab.tab_login', {
      url: '/tab_login?{:nextStep}',
      hideTab: true,
      views: {
        'tab-mine': {
          templateUrl: 'component/tab_login/tab_login.html',
          controller: 'tab_loginCtrl'
        }
      }
    });
};
myapp.config(tab_login_myConfig);

angular.module('starter.tab_login', [])
  .controller('tab_loginCtrl', function($scope, $state, $stateParams, Common, toast, cordovaPlug, $timeout) {
    cordovaPlug.CommonPL(function(data) {
      if (data.status == 1) {
        Common.setCache('getDeviceIdAndClientId', data.data);
      } else {
        toast.show("插件调用失败！");
      }
    }, "getDeviceIdAndClientId", [])
    $scope.show_pwd = false;
    $scope.canLogin = false;
    var regPhone = /^1(3|4|5|7|8)\d{9}$/;
    $scope.gotoIndex = function() {
      $state.go('tab.index')
    }
    $scope.$on('$ionicView.beforeEnter', function() {
      if (Common.getCache('Token') != null) {
        Common.showLoading();
        $timeout(function() {
          Common.hideLoading();
          $state.go('tab.index');
        }, 1000)

      }
      var lastUser = Common.getCache('lastUser') || "";
      $scope.data = {
        phone: lastUser,
        pwd: ''
      };
     

      $scope.clearPhone = function() {
        //点击叉号时清除手机号码 
        $scope.data.phone = '';
      }

      $scope.showPwd = function() {
          if (!$scope.show_pwd) {
            //显示密码
            $scope.show_pwd = true;
            $scope.pwd_focus = false;
            $scope.phone_focus = false;
          } else {
            //隐藏密码 
            $scope.show_pwd = false;
            $scope.pwd_focus = false;
            $scope.phone_focus = false;
          }
        }

        $scope.$watch("data.phone", function() {
          $scope.$watch("data.pwd", function() {
            // if (regPhone.test($scope.data.phone) && $scope.data.pwd.length >= 8) {
            if ($scope.data.phone || $scope.data.pwd.length) {
              $scope.canLogin = true;
            } else {
              $scope.canLogin = false;
            }
          })
        })
        //返回注册
      $scope.gotoRegister = function() {
          if ($stateParams.nextStep == 1) $state.go("tab.tab_register", {
            "nextStep": 1
          });
          else $state.go("tab.tab_register");
        }
        //登陆
      $scope.login = function() {
          var tel = $scope.data.phone;
          var pwd = $scope.data.pwd;
          if (tel || pwd) {
            if (tel) {
              if (regPhone.test(tel)) {
                if (pwd) {
                  if ($scope.canLogin) {
                    //TODO: 登录
                    var myDevice = Common.getCache('getDeviceIdAndClientId') || {};
                    Common.setCache('lastUser', $scope.data.phone);
                    Common.post_login('lifeAPI/login', {
                      deviceName: myDevice.deviceName || "",
                      deviceVersion: myDevice.deviceVersion || "",
                      username: $scope.data.phone,
                      password: $scope.data.pwd
                    }, function(data) {
                      Common.setCache('LoggedOn', true);
                      //向原生外放极光推送广播
                      Common.setCache('Token', data.data);
                      Common.setCache('lastUser', $scope.data.phone);
                      Common.get('lifeAPI/user/info', {}, function(_data) {
                        Common.setCache('information', _data.data);
                        Common.hideLoading();
                        if ($stateParams.nextStep != undefined) {
                          //判断是否实名
                          if (_data.data.authStatus == 0) {
                            $state.go("tab.my_certification", {
                              "nextStep": $stateParams.nextStep
                            })
                          }else{
                            $state.go('tab.index');
                          }
                        } else {
                          $state.go('tab.index');
                        }
                      }, {})
                      cordovaPlug.CommonPL(function(data) {}, "login", [data.data.userId]);
                      Common.UMclickEvent("loginEvent");
                    }, {})
                  }
                } else {
                  toast.show("请输入您的密码")
                }
              } else {
                toast.show("请输入正确格式的手机号")
              }
            } else {
              toast.show("请输入您的手机号")
            }
          }
        } //登陆end
    });
  });