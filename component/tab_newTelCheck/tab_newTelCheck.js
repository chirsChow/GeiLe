var tab_newTelCheck_myConfig = function($stateProvider) {
  $stateProvider
    .state('tab.tab_newTelCheck', {
      url: '/tab_newTelCheck',
      views: {
        'tab-mine': {
          templateUrl: 'component/tab_newTelCheck/tab_newTelCheck.html',
          controller: 'tab_newTelCheckCtrl'
        }
      }
    });
};
myapp.config(tab_newTelCheck_myConfig);

angular.module('starter.tab_newTelCheck', [])
  .controller('tab_newTelCheckCtrl', function($scope, $interval, toast, $state, Common) {

    $scope.secondLeft = "获取验证码";
    $scope.checkPhone = true;
    $scope.seconds = 59;
    $scope.isCounting = false;


    //短信倒计时
    $scope.count = function() {
      $scope.secondLeft = "59s后重发";
      timer = $interval(function() {
        $scope.seconds--;
        if ($scope.seconds != 0) {
          $scope.seconds = $scope.seconds >= 10 ? $scope.seconds : "0" + $scope.seconds;
          $scope.secondLeft = $scope.seconds + "s后重发";
        } else {
          //可以点击发送验证码
          $interval.cancel(timer);
          $scope.isCounting = false;
          $scope.seconds = 59;
          $scope.secondLeft = "重新发送";
        }
      }, 1000)
    }


    //获取验证码
    $scope.getCode = function() {
      var tel = $scope.inputData.newTel;
      var reg = /^1(3|4|5|7|8)\d{9}$/;
      if (!$scope.isCounting) {
        //如果获取短信验证码按钮不可以点击
        if (reg.test(tel)) {
          $scope.count();
          $scope.isCounting = true;
          Common.sendMessage(tel, "1", function() {})
        } else {
          toast.show('请输入正确的手机号码');
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
        $interval.cancel(timer);
        $scope.isCounting = false;
        $scope.seconds = 59;
        $scope.secondLeft = "重新发送";
      }
    }, false);

    $scope.next = function() {
      var tel = $scope.inputData.newTel;
      var code = $scope.checkCode;
      if (/^\d{6}$/.test(code)) {
        //发送验证码到旧手机$scope.information.mobilePhone
        // $state.go('tab.tab_oldTelCheck', {
        //   "tel": tel,
        //   "code": code
        // });
        //新手机号校验通过才能下一步

        Common.post("lifeAPI/sms/verifySms", {
          "businessType": "1",
          "phoneNo": $scope.inputData.newTel,
          "verifyCode": $scope.checkCode
        }, function(data) {
          Common.sendMessage($scope.information.mobilePhone, "4", function() {})
          $state.go('tab.tab_oldTelCheck', {
            "tel": tel,
            "code": code
          });
        }, {})
      } else {
        toast.show('请检查验证码');
      }
    }

    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.information = Common.getCache('information');
      $scope.inputData = {
        newTel: ''
      }
      $scope.checkCode = ''
    });
  });