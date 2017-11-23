var tab_loginByCode_myConfig = function($stateProvider) {
  $stateProvider
    .state('tab.tab_loginByCode', {
      url: '/tab_loginByCode/:id',
      views: {
        'tab-mine': {
          templateUrl: 'component/tab_loginByCode/tab_loginByCode.html',
          controller: 'tab_loginByCodeCtrl'
        }
      }
    });
};
myapp.config(tab_loginByCode_myConfig);

angular.module('starter.tab_loginByCode', [])
  .controller('tab_loginByCodeCtrl', function($scope, $stateParams, $interval, toast, Common, cordovaPlug, $state) {
    var timer;
    $scope.btnText = "发送验证码";
    $scope.checkPhone = false;
    $scope.seconds = 59;
    $scope.canLogin = false;
    $scope.isCounting = false;
    var regPhone = /^1(3|4|5|7|8)\d{9}$/;


    // 监听手机输入，点亮发送验证码按钮
    $scope.$watch('inputData.check_phone', function() {
      var tel = $scope.inputData.check_phone;
      if (regPhone.test(tel) && $scope.seconds == 59) $scope.checkPhone = true;
      else $scope.checkPhone = false;
    })

    $scope.$watch("inputData.check_phone", function() {
      $scope.$watch("inputData.check_code", function() {
        // if (regPhone.test($scope.inputData.check_phone) && /^\d{6}$/.test($scope.inputData.check_code)) {
        if ($scope.inputData.check_phone || $scope.inputData.check_code) {
          $scope.canLogin = true;
        } else {
          $scope.canLogin = false;
        }
      })
    })


    //短信倒计时
    $scope.count = function() {
      $scope.seconds = 59;
      $scope.btnText = "59S";
      timer = $interval(function() {
        $scope.seconds--;
        if ($scope.seconds != 0) {
          $scope.seconds = $scope.seconds >= 10 ? $scope.seconds : "0" + $scope.seconds;
          $scope.btnText = $scope.seconds + "S";
        } else {
          $scope.isCounting = false;
          $interval.cancel(timer);
          $scope.seconds = 59;
          $scope.btnText = "重新发送";
          if (regPhone.test($scope.inputData.check_phone)) {
            $scope.checkPhone = true;
          } else {
            $scope.checkPhone = false;
          }
        }
      }, 1000)
    }

    //发送短信验证码

    $scope.gotoSendMessage = function() {
      var tel = $scope.inputData.check_phone;
      if ($scope.btnText == "发送验证码" || $scope.btnText == "重新发送") {
        if (!tel) {
          toast.show('请输入手机号');
          return;
        }
        if (!regPhone.test(tel)) {
          toast.show('请输入正确的手机号');
          return;
        }

        if ($scope.checkPhone) {
          $scope.checkPhone = false;
          $scope.count();
          $scope.isCounting = true;
          Common.sendMessage(tel, "2", function() {})
        }
      }
    }

    //IOS计时缓慢问题
    var hiddenTime, visibleTime;
    document.addEventListener("pause", function() {
      if (!$scope.isCounting) return;
      hiddenTime = new Date().getTime();
      visibleTime = $scope.seconds;
    }, false);
    document.addEventListener("resume", function() {
      if (!$scope.isCounting) return;
      var timemax = visibleTime - ((new Date().getTime() - hiddenTime) / 1000 | 0)
      if (timemax > 0) {
        $scope.seconds = timemax;
      } else {
        $scope.isCounting = false;
        $interval.cancel(timer);
        $scope.seconds = 59;
        $scope.btnText = "重新发送";
        if (regPhone.test($scope.inputData.check_phone)) {
          $scope.checkPhone = true;
        } else {
          $scope.checkPhone = false;
        }
      }
    }, false);


    //登陆
    $scope.login = function() {
        var tel = $scope.inputData.check_phone;
        var vCode = $scope.inputData.check_code;
        if (tel || vCode) {
          if (tel) {
            if (regPhone.test(tel)) {
              if (vCode) {
                if ($scope.canLogin) {
                  //TODO: 登录
                  Common.showLoading();
                  var myDevice = Common.getCache('getDeviceIdAndClientId') || {};
                  Common.post_login('lifeAPI/login', {
                    deviceName: myDevice.deviceName || '',
                    deviceVersion: myDevice.deviceVersion || '',
                    username: $scope.inputData.check_phone,
                    password: '',
                    verificationCode: $scope.inputData.check_code
                  }, function(data) {
                    Common.setCache('LoggedOn', true);
                    //向原生外放极光推送广播
                    cordovaPlug.CommonPL(function(data) {}, "login", [data.data.userId])
                    Common.setCache('Token', data.data);
                    Common.setCache('lastUser', $scope.inputData.check_phone);
                    //获取银行卡
                    Common.get('lifeAPI/user/info', {}, function(_data) {
                      Common.setCache('information', _data.data);
                      var myData = Common.getCache('banklistColor').data;
                      Common.hideLoading();
                      if ($stateParams.nextStep != undefined) {
                        //判断是否实名
                        if (_data.data.authStatus == 0) {
                          $state.go("tab.my_certification", {
                            "nextStep": $stateParams.nextStep
                          })
                        } else {
                          $state.go('tab.index');
                          // Common.get('lifeAPI/payment/fft/card/', {
                          //   'type': 0
                          // }, function(data) {
                          //   var oldData = data.data;
                          //   for (var i = 0; i < oldData.length; i++) {
                          //     if (myData[oldData[i].bankIndex] != undefined) {
                          //       oldData[i].bankImg = 'img/bank/' + myData[oldData[i].bankIndex].icon;
                          //       oldData[i].color = myData[oldData[i].bankIndex].color;
                          //     }
                          //   }
                            
                          // }, {});
                        }
                      } else {
                        $state.go('tab.index');
                      }
                    }, {})
                  }, {})
                }
              } else {
                toast.show("请输入手机验证码")
              }
            } else {
              toast.show("请输入正确的手机号")
            }
          } else {
            toast.show("请输入您的手机号")
          }
        }
      } //登陆end

    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.inputData = {
        check_phone: $stateParams.id ? $stateParams.id : Common.getCache('lastUser') || "",
        check_code: ''
      };
    });
  });