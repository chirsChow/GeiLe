var tab_registerConfirm_myConfig = function($stateProvider) {
  $stateProvider
    .state('tab.tab_registerConfirm', {
      url: '/tab_registerConfirm/:regToken/:tel?{:nextStep}',
      views: {
        'tab-mine': {
          templateUrl: 'component/tab_registerConfirm/tab_registerConfirm.html',
          controller: 'tab_registerConfirmCtrl'
        }
      }
    });
};
myapp.config(tab_registerConfirm_myConfig);

angular.module('starter.tab_registerConfirm', [])
  .controller('tab_registerConfirmCtrl', function($scope, $stateParams, $state, toast, Common, cordovaPlug) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.pwd_focus = false;
      $scope.pwdConfirm_focus = false;
      $scope.inputData = {
        pwd: '',
        pwdConfirm: ''
      }
      $scope.filled = false;
      $scope.$watch('inputData.pwd', function() {
        $scope.$watch('inputData.pwdConfirm', function() {
          // var regPwd = /^[^/|\\|\s|\u4e00-\u9fa5]{8,16}$/;
          // if (($scope.inputData.pwd === $scope.inputData.pwdConfirm) && regPwd.test($scope.inputData.pwdConfirm)) {
          if ($scope.inputData.pwd || $scope.inputData.pwdConfirm) {
            $scope.filled = true;
          } else {
            $scope.filled = false;
          }
        })
      })

      //注册完成
      $scope.register = function() {
        var pwd = $scope.inputData.pwd;
        var pwdConfirm = $scope.inputData.pwdConfirm;
        var reg = /^[^/|\\|\s|\u4e00-\u9fa5]{8,16}$/;
        var regAllNum = /^\d{8,16}$/;
        var regAllAlphabet = /^[a-zA-Z]{8,16}$/;
        var regAllSymbol = /^^[!@`~#\*^+-.%&<>()',;_"'=?\$\x22]{8,16}$/;
        //如果密码、确认密码都有输入
        if (pwd && pwdConfirm) {
          if (reg.test(pwd) && reg.test(pwdConfirm)) {
            if (pwd === pwdConfirm) {
              //检查密码是否为纯数字或纯字母或纯字符
              if (!regAllNum.test(pwdConfirm) && !regAllAlphabet.test(pwdConfirm) && !regAllSymbol.test(pwdConfirm)) {
                //TODO: 注册成功
                var myDevice = Common.getCache('getDeviceIdAndClientId') || {};
                Common.post_login('lifeAPI/register', {
                  deviceName: myDevice.deviceName || "",
                  deviceVersion: myDevice.deviceVersion || "",
                  "username": $stateParams.tel,
                  "password": $scope.inputData.pwdConfirm,
                  "regToken": $stateParams.regToken
                }, function(data) {
                  $scope.tips = false;
                  Common.post_login('lifeAPI/login', {
                    deviceName: myDevice.deviceName || "",
                    deviceVersion: myDevice.deviceVersion || "",
                    username: $stateParams.tel,
                    password: $scope.inputData.pwdConfirm
                  }, function(data) {
                    Common.setCache('LoggedOn', true);
                    //向原生外放极光推送广播
                    cordovaPlug.CommonPL(function(data) {}, "login", [data.data.userId])
                    Common.setCache('Token', data.data);
                    Common.setCache('lastUser', $stateParams.tel);
                    //获取银行卡
                    Common.get('lifeAPI/user/info', {}, function(_data) {
                      Common.setCache('information', _data.data);
                      //缓存银行卡信息
                      var myData = Common.getCache('banklistColor').data;
                      $state.go('tab.index');
                      toast.show("恭喜您已经注册成功了！")
                      // Common.get('lifeAPI/payment/fft/card/', {
                      //   'type': 0
                      // }, function(data) {
                      //   Common.hideLoading();
                      //   var oldData = data.data;
                      //   for (var i = 0; i < oldData.length; i++) {
                      //     oldData[i].bankImg = 'img/bank/' + myData[oldData[i].bankIndex].icon;
                      //     oldData[i].color = myData[oldData[i].bankIndex].color;
                      //   }
                        
                      // }, {});
                    }, {})
                  }, {})
                }, {});
              } else {
                toast.show("密码为数字与字母组合,请重新输入")
              }
            } else {
              toast.show("两次密码输入不一致")
            }
          } else if (!reg.test(pwd)) {
            toast.show("密码格式错误")
          } else {
            toast.show("密码格式错误")
          }
        } else if (!pwd) { //如果密码没有输入
          toast.show("请输入密码")
        } else { //确认密码没有输入
          if (reg.test(pwd)) {
            toast.show("密码格式错误")
          } else {
            toast.show("请输入确认密码")
          }
        }
      }
    });
  });