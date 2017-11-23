var tab_register_myConfig = function($stateProvider) {
  $stateProvider
    .state('tab.tab_register', {
      url: '/tab_register?{:nextStep}',
      hideTab: true,
      views: {
        'tab-mine': {
          templateUrl: 'component/tab_register/tab_register.html',
          controller: 'tab_registerCtrl'
        }
      }
    });
};
myapp.config(tab_register_myConfig);

angular.module('starter.tab_register', [])
  .controller('tab_registerCtrl', function($scope, Common, toast, $interval, $state, $ionicHistory, $stateParams) {
    $scope.isAgree = true;
    $scope.btnText = "发送验证码";
    $scope.seconds = 59;
    $scope.isCounting = false;
    $scope.singleClick = true;
    $scope.inputData = {
      phone: '',
      check_code: ''
    };

    var regPhone = /^1(3|4|5|7|8)\d{9}$/;
    var myClickBoo = true,
      timer;
    $scope.canNext = false;

    $scope.$watch("inputData.phone", function() {
      $scope.$watch("inputData.check_code", function() {
        // if (regPhone.test($scope.inputData.phone) && /^\d{6}$/.test($scope.inputData.check_code) && $scope.isAgree) {
        if ($scope.inputData.phone || $scope.inputData.check_code) {
          $scope.canNext = true;
        } else {
          $scope.canNext = false;
        }
      })
    })



    $scope.gotoLogin = function() {
      if ($stateParams.nextStep == 1) $state.go('tab.tab_login', {
        "nextStep": 1
      });
      else $state.go('tab.tab_login');
    }

    //短信倒计时
    $scope.count = function() {
      $scope.btnText = "59S";
      timer = $interval(function() {
        $scope.seconds--;
        if ($scope.seconds != 0) {
          $scope.seconds = $scope.seconds >= 10 ? $scope.seconds : "0" + $scope.seconds;
          $scope.btnText = $scope.seconds + "S";
        } else {
          //可以点击发送验证码
          $scope.isCounting = false;
          $interval.cancel(timer);
          $scope.seconds = 59;
          $scope.btnText = "重新发送";
        }
      }, 1000)
    }

    // 判断用户是否同意《给乐生活用户协议》才能点击下一步
    $scope.toggleIcon = function() {
      $scope.isAgree = !$scope.isAgree;
      if (!$scope.isAgree) {
        toast.show('请勾选给乐生活协议')
      }
    }

    //发送验证码
    $scope.sendCode = function() {
      var tel = $scope.inputData.phone;
      if (!$scope.isCounting) {
        if (tel) {
          if (regPhone.test($scope.inputData.phone)) {
            $scope.count();
            $scope.isCounting = true;
            Common.sendMessage($scope.inputData.phone, "0", function() {})
          } else {
            toast.show("请输入正确格式的手机号")
          }
        } else {
          toast.show('请先输入手机号')
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
      }
    }, false);


    //下一步
    $scope.next = function() {
      //TODO: 获取短信验证码并校验
      var tel = $scope.inputData.phone;
      var vCode = $scope.inputData.check_code;

      // if (!regPhone.test(tel)) {
      //   toast.show("请输入正确的手机号");
      //   return
      // }
      // if (!vCode) {
      //   toast.show("请输入手机验证码");
      //   return;
      // }
      // if (!$scope.isAgree) {
      //   toast.show('请勾选同意协议');
      //   return
      // }
      // if (1){
      //   $scope.singleClick = false;
      //   Common.get('lifeAPI/regToken', {
      //     "vCode": vCode,
      //     "username": tel
      //   }, function(data) {
      //     // myClickBoo == true;
      //     $scope.singleClick = true;
      //     $state.go('tab.tab_registerConfirm', {
      //       "tel": tel,
      //       "regToken": data.data.regToken
      //     });
      //   }, function() {
      //     // myClickBoo == true;
      //     $scope.singleClick = true;
      //   })
      // }


      if (tel || vCode) {
        if (tel) {
          if (regPhone.test(tel)) {
            if (vCode) {
              if ($scope.canNext && myClickBoo && $scope.isAgree) {
                myClickBoo == false;
                Common.get('lifeAPI/regToken', {
                  "vCode": vCode,
                  "username": tel
                }, function(data) {
                  myClickBoo == true;
                  $state.go('tab.tab_registerConfirm', {
                    "tel": tel,
                    "regToken": data.data.regToken
                  });
                }, function() {
                  myClickBoo == true;
                })
              } else {
                toast.show('请勾选给乐生活协议');
              }
            } else {
              toast.show("请输入手机验证码")
            }
          } else {
            toast.show("请输入正确的手机号")
          }
        } else {
          // toast.show("请输入正确的手机号")
          toast.show("请先输入手机号")
        }
      }

    }
    $scope.$on('$ionicView.beforeEnter', function() {

    });
  });