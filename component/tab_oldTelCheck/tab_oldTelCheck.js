var tab_oldTelCheck_myConfig = function($stateProvider) {
  $stateProvider
    .state('tab.tab_oldTelCheck', {
      url: '/tab_oldTelCheck/:tel/:code',
      views: {
        'tab-mine': {
          templateUrl: 'component/tab_oldTelCheck/tab_oldTelCheck.html',
          controller: 'tab_oldTelCheckCtrl'
        }
      }
    });
};
myapp.config(tab_oldTelCheck_myConfig);

angular.module('starter.tab_oldTelCheck', [])
  .controller('tab_oldTelCheckCtrl', function($scope, $stateParams, $interval, toast, $state, Common) {
    var timer;
    $scope.seconds = 59;
    $scope.secondLeft = 59 + "S后重发";
    $scope.checkPhone = false;
    $scope.isCounting = true;
    //短信倒计时
    $scope.count = function() {
      $scope.seconds = 59;
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

    //一进入页面立马倒计时
    $scope.count();

    //点击获取短信验证码
    $scope.sendCode = function() {
      if (!$scope.isCounting) {
        $scope.checkCode = '';
        $scope.count();
        $scope.isCounting = true;
        $scope.light = false;
        Common.sendMessage($scope.information.mobilePhone, "4", function() {
        })
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

    //完成
    $scope.complete = function() {
      var checkCode = $scope.checkCode;
      if (checkCode) {
        Common.put('lifeAPI/user/mobilePhone', {
          "oldMobilePhone": $scope.information.mobilePhone,
          "oldverificationCode": $scope.checkCode,
          "newMobilePhone": $stateParams.tel,
          "newverificationCode": $stateParams.code
        }, function(data) {
          console.log(data);
          Common.delete('lifeAPI/logout/', {}, function(data) {
            console.log(data);
            Common.clearCache('Token');
            Common.clearCache('information');
            Common.clearCache('balanceNum');
            Common.clearCache('hasClickBalance');
            $state.go("tab.tab_login");
          }, {})
        }, {})
      } else {
        toast.show('请输入验证码~');
      }
    }

    $scope.$on('$ionicView.beforeEnter', function() {
      //TODO：获取原手机号
      $scope.information = Common.getCache('information');
    });
  });